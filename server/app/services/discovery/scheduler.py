import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.config import settings
from app.database import SessionLocal
from app.services.discovery.pipeline import discovery_agent

logger = logging.getLogger("orbinex.discovery.scheduler")

class DiscoveryScheduler:
    """
    Background Autonomous Refresh Scheduler for Opportunity Discovery.
    Runs independently of browser requests; refreshes data automatically on schedule.
    """

    def __init__(self):
        self.is_running = False
        self.interval_minutes = settings.DISCOVERY_INTERVAL_MINUTES
        self.last_run_iso: Optional[str] = None
        self.next_run_iso: Optional[str] = None
        self.total_runs: int = 0
        self.last_run_stats: Dict[str, Any] = {}
        self._task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()

    def get_status(self) -> Dict[str, Any]:
        return {
            "scheduler_active": self.is_running,
            "interval_minutes": self.interval_minutes,
            "total_runs": self.total_runs,
            "last_run_iso": self.last_run_iso,
            "next_run_iso": self.next_run_iso,
            "last_run_stats": self.last_run_stats
        }

    async def _scheduler_loop(self):
        logger.info(f"Discovery Scheduler background loop started (Interval: {self.interval_minutes}m)")
        self.is_running = True

        # Initial run on startup (with brief grace period so server binds first)
        await asyncio.sleep(5)
        await self.execute_once()

        while not self._stop_event.is_set():
            next_time = datetime.utcnow() + timedelta(minutes=self.interval_minutes)
            self.next_run_iso = next_time.isoformat()
            
            try:
                # Wait for interval or stop signal
                await asyncio.wait_for(self._stop_event.wait(), timeout=self.interval_minutes * 60)
                break
            except asyncio.TimeoutError:
                # Interval elapsed -> execute discovery
                await self.execute_once()

        self.is_running = False
        logger.info("Discovery Scheduler loop terminated.")

    async def execute_once(self) -> Dict[str, Any]:
        """
        Runs a single discovery cycle in a non-blocking thread executor.
        """
        logger.info("Executing scheduled opportunity discovery cycle...")
        loop = asyncio.get_event_loop()

        def _sync_run():
            db = SessionLocal()
            try:
                return discovery_agent.run_discovery(db=db)
            finally:
                db.close()

        try:
            stats = await loop.run_in_executor(None, _sync_run)
            self.last_run_iso = datetime.utcnow().isoformat()
            self.total_runs += 1
            self.last_run_stats = stats
            logger.info(f"Discovery execution #{self.total_runs} finished: {stats.get('stored_new_count', 0)} new items stored.")
            return stats
        except Exception as e:
            logger.error(f"Error during scheduled discovery execution: {e}")
            err_stats = {"status": "error", "error": str(e), "timestamp": datetime.utcnow().isoformat()}
            self.last_run_stats = err_stats
            return err_stats

    def start(self):
        if self._task is None or self._task.done():
            self._stop_event.clear()
            self._task = asyncio.create_task(self._scheduler_loop())
            logger.info("Autonomous discovery scheduler background task initialized.")

    def stop(self):
        if self._task and not self._task.done():
            self._stop_event.set()
            self._task.cancel()
            logger.info("Autonomous discovery scheduler stopped.")

discovery_scheduler = DiscoveryScheduler()
