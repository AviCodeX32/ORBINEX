from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import ApplicationTracker, ApplicationTask, Opportunity
from app.schemas import (
    ApplicationTrackerOut, ApplicationTrackerCreate, ApplicationTrackerUpdate,
    ApplicationTaskOut, ApplicationTaskCreate
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/tracker", tags=["tracker"])

@router.get("", response_model=List[ApplicationTrackerOut])
def get_user_applications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    apps = (
        db.query(ApplicationTracker)
        .options(
            joinedload(ApplicationTracker.opportunity),
            joinedload(ApplicationTracker.tasks)
        )
        .filter(ApplicationTracker.user_id == current_user.id)
        .order_by(ApplicationTracker.updated_at.desc())
        .all()
    )
    return apps


@router.post("", response_model=ApplicationTrackerOut, status_code=status.HTTP_201_CREATED)
def add_to_tracker(
    data: ApplicationTrackerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify opportunity exists
    opp = db.query(Opportunity).filter(Opportunity.id == data.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Check if already tracked
    existing = db.query(ApplicationTracker).filter(
        ApplicationTracker.user_id == current_user.id,
        ApplicationTracker.opportunity_id == data.opportunity_id
    ).first()

    if existing:
        existing.status = data.status
        if data.notes:
            existing.notes = data.notes
        db.commit()
        db.refresh(existing)
        return existing

    # Create new tracker entry
    new_app = ApplicationTracker(
        user_id=current_user.id,
        opportunity_id=data.opportunity_id,
        status=data.status,
        deadline=opp.deadline,
        applied_date=data.applied_date or (datetime.utcnow() if data.status != "SAVED" else None),
        follow_up_date=data.follow_up_date,
        notes=data.notes,
        submission_url=data.submission_url,
        match_score=88
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    # Seed initial practical default tasks
    default_tasks = [
        "Review official eligibility guidelines & rules",
        "Prepare CV / GitHub portfolio link",
        "Submit final application before deadline"
    ]
    for t_title in default_tasks:
        task = ApplicationTask(
            application_tracker_id=new_app.id,
            title=t_title,
            is_completed=False,
            due_date=opp.deadline,
            priority="medium"
        )
        db.add(task)
    db.commit()
    db.refresh(new_app)

    # Increment applications count on opportunity
    opp.applications_count += 1
    db.commit()

    return new_app


@router.patch("/{id}", response_model=ApplicationTrackerOut)
def update_tracker(
    id: int,
    data: ApplicationTrackerUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    app_entry = db.query(ApplicationTracker).filter(
        ApplicationTracker.id == id,
        ApplicationTracker.user_id == current_user.id
    ).first()

    if not app_entry:
        raise HTTPException(status_code=404, detail="Tracked application not found")

    if data.status is not None:
        app_entry.status = data.status
        if data.status == "APPLIED" and not app_entry.applied_date:
            app_entry.applied_date = datetime.utcnow()
    if data.notes is not None:
        app_entry.notes = data.notes
    if data.submission_url is not None:
        app_entry.submission_url = data.submission_url
    if data.follow_up_date is not None:
        app_entry.follow_up_date = data.follow_up_date

    app_entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(app_entry)
    return app_entry


@router.delete("/{id}")
def delete_from_tracker(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    app_entry = db.query(ApplicationTracker).filter(
        ApplicationTracker.id == id,
        ApplicationTracker.user_id == current_user.id
    ).first()

    if not app_entry:
        raise HTTPException(status_code=404, detail="Tracked application not found")

    db.delete(app_entry)
    db.commit()
    return {"status": "deleted", "id": id}


# --- Task Checklist Endpoints ---
@router.post("/{id}/tasks", response_model=ApplicationTaskOut)
def add_application_task(
    id: int,
    task_in: ApplicationTaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    app_entry = db.query(ApplicationTracker).filter(
        ApplicationTracker.id == id,
        ApplicationTracker.user_id == current_user.id
    ).first()
    if not app_entry:
        raise HTTPException(status_code=404, detail="Tracked application not found")

    task = ApplicationTask(
        application_tracker_id=app_entry.id,
        title=task_in.title,
        is_completed=task_in.is_completed,
        due_date=task_in.due_date,
        priority=task_in.priority
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}/toggle", response_model=ApplicationTaskOut)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    task = db.query(ApplicationTask).join(ApplicationTracker).filter(
        ApplicationTask.id == task_id,
        ApplicationTracker.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    task = db.query(ApplicationTask).join(ApplicationTracker).filter(
        ApplicationTask.id == task_id,
        ApplicationTracker.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"status": "deleted", "id": task_id}
