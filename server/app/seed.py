from datetime import datetime, timedelta
from app.database import engine, SessionLocal, Base
from app.models import (
    User, Opportunity, OpportunityDuplicate, ApplicationTracker,
    ApplicationTask, PartnerOrganization, SourceHealth
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding/Verifying ORBINEX initial intelligence dataset...")

    # 1. Seed Default Student User if not exists
    if db.query(User).filter(User.id == 1).first() is None:
        user = User(
            id=1,
            email="aarav.sharma@orbinex.ai",
            full_name="Aarav Sharma",
            role="student",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            bio="Final year CSE undergrad passionate about Distributed Systems, Fullstack & Generative AI. 2x Hackathon finalist.",
            education_level="Undergraduate",
            university="Indian Institute of Technology (IIT) Delhi",
            degree="B.Tech Computer Science & Engineering",
            graduation_year=2026,
            cgpa=9.15,
            skills=["Python", "FastAPI", "React", "TypeScript", "Machine Learning", "PyTorch", "Docker", "Next.js", "PostgreSQL"],
            interests=["AI/ML", "Web Development", "Hackathons", "Open Source", "FinTech", "Cloud Systems"],
            target_types=["hackathon", "internship", "fellowship", "scholarship"],
            location_preference="Hybrid / Remote",
            github_url="https://github.com/aarav-sharma-dev",
            linkedin_url="https://linkedin.com/in/aaravsharma-tech",
            portfolio_url="https://aaravsharma.dev",
            notification_preferences={
                "email_alerts": True,
                "deadline_reminders": True,
                "daily_digest": False,
                "verified_only": True
            }
        )
        db.add(user)
        db.commit()

    # 2. Seed Partner Organizations
    if db.query(PartnerOrganization).count() == 0:
        partners = [
            PartnerOrganization(
                name="Devfolio Ecosystem",
                domain="devfolio.co",
                logo_url="https://assets.devfolio.co/content/b5952d431c194beeb6110f0f354fcfb7/713f0ce9-6888-466f-85ff-1f543166d3a8.png",
                tier="verified_partner",
                is_verified=True,
                contact_email="partnerships@devfolio.co",
                website_url="https://devfolio.co",
                opportunities_count=4
            ),
            PartnerOrganization(
                name="AICTE Innovation Cell",
                domain="aicte-india.org",
                logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/All_India_Council_for_Technical_Education_logo.png/220px-All_India_Council_for_Technical_Education_logo.png",
                tier="university_partner",
                is_verified=True,
                contact_email="mic-support@aicte-india.org",
                website_url="https://mic.gov.in",
                opportunities_count=2
            ),
            PartnerOrganization(
                name="Flipkart Talent & Engineering",
                domain="flipkart.com",
                logo_url="/logos/flipkart.svg",
                tier="verified_partner",
                is_verified=True,
                contact_email="campus@flipkart.com",
                website_url="https://flipkartcareers.com",
                opportunities_count=2
            ),
            PartnerOrganization(
                name="Google Open Source",
                domain="google.com",
                logo_url="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png",
                tier="verified_partner",
                is_verified=True,
                contact_email="gsoc-support@google.com",
                website_url="https://summerofcode.withgoogle.com",
                opportunities_count=1
            )
        ]
        db.add_all(partners)
        db.commit()

    # 3. Seed Source Health
    if db.query(SourceHealth).count() == 0:
        sources = [
            SourceHealth(
                source_name="Devfolio Official Public API",
                connector_type="API",
                target_url="https://api.devfolio.co/v2/hackathons",
                status="healthy",
                latency_ms=124,
                items_discovered=48,
                freshness_score=99
            ),
            SourceHealth(
                source_name="Unstop Partner Feed Connector",
                connector_type="RSS_FEED",
                target_url="https://unstop.com/api/public/competitions",
                status="healthy",
                latency_ms=210,
                items_discovered=72,
                freshness_score=96
            ),
            SourceHealth(
                source_name="Smart India Hackathon AICTE Portal",
                connector_type="HTML_PARSER",
                target_url="https://sih.gov.in",
                status="healthy",
                latency_ms=315,
                items_discovered=12,
                freshness_score=94
            ),
            SourceHealth(
                source_name="Devpost Hackathons Crawler",
                connector_type="API",
                target_url="https://devpost.com/api/hackathons",
                status="healthy",
                latency_ms=189,
                items_discovered=35,
                freshness_score=97
            )
        ]
        db.add_all(sources)
        db.commit()

    now = datetime.utcnow()

    # 4. Seed Verified Opportunities (Real-world reference style)
    opps = [
        Opportunity(
            slug="smart-india-hackathon-2026",
            title="Smart India Hackathon (SIH) 2026 — Hardware & Software Edition",
            organizer="Ministry of Education & AICTE",
            organizer_logo="https://sih.gov.in/img1/SIH2024-logo.png",
            category="hackathon",
            mode="hybrid",
            location="Nodal Centers across India / Remote Screening",
            short_description="World's biggest open innovation challenge bringing students together to solve pressing problems from government ministries and premier industries.",
            full_description="""Smart India Hackathon 2026 is a nationwide initiative by the Ministry of Education's Innovation Cell (MIC) and AICTE to provide students with a platform to solve pressing problems of ministries, departments, industries, and other organizations.

Key Tracks:
• Smart Education, Disaster Management, Clean & Green Technology
• Healthcare, Blockchain & Cybersecurity, Smart Automation
• Robotics, Smart Vehicles, Agriculture & Rural Development

Evaluation & Rounds:
1. Internal College Hackathon & SPOC nomination (Top 5 teams per college).
2. Central Committee Preliminary Evaluation & Screening.
3. 36-Hour Non-stop Grand Finale at assigned premier Nodal Institutes.

Prizes & Benefits:
• ₹1,00,000 cash prize per problem statement.
• Fast-track incubation support and startup grant funding.
• Direct interview rounds with enterprise sponsor partners.""",
            direct_registration_url="https://sih.gov.in",
            official_website_url="https://sih.gov.in",
            prize_or_stipend_amount=1000000.0,
            prize_currency="INR",
            prize_description="₹1,00,000 per Problem Statement + Govt Incubation",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=18),
            start_date=now + timedelta(days=25),
            end_date=now + timedelta(days=27),
            eligibility_education=["Undergraduate", "Postgraduate"],
            eligibility_criteria=[
                "College students enrolled in AICTE/UGC recognized engineering, technology, or science universities",
                "Team of exactly 6 students, strictly with at least 1 female team member",
                "College SPOC authorization letter required upon finalist selection"
            ],
            skills_required=["Python", "React", "AI/ML", "IoT", "FastAPI", "Cloud Deployment"],
            tags=["Govt of India", "AICTE", "Grand Finale", "National Stage", "High Impact"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=98,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Government Initiative",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Official .gov.in domain authenticated",
                    "Government AICTE press gazette confirmed",
                    "Zero registration fee verified"
                ]
            },
            source_platform="Official Partner",
            source_url="https://sih.gov.in",
            views_count=3420,
            clicks_count=1280,
            applications_count=412,
            is_featured=True
        ),
        Opportunity(
            slug="ethindia-2026-hackathon",
            title="ETHIndia 2026 — Asia's Premier Ethereum Hackathon",
            organizer="Devfolio & Ethereum Foundation",
            organizer_logo="https://assets.devfolio.co/hackathons/ethindia2023/assets/favicon/favicon.png",
            category="hackathon",
            mode="in-person",
            location="KTPO, Whitefield, Bengaluru, India",
            short_description="Build the decentralized future with 2,000+ builders, mentors, and global protocols at Asia's largest Web3 and Smart Contract hackathon.",
            full_description="""ETHIndia is the flagship hackathon in the Ethereum ecosystem, organized by Devfolio. Join brilliant developers, designers, and researchers in Bengaluru to hack, learn, and launch decentralized applications.

Bounties & Sponsor Tracks:
• Ethereum Foundation Core Infrastructure
• Layer 2 Scalability (Arbitrum, Optimism, Polygon, Base)
• Account Abstraction & Zero Knowledge Proofs (ZK)
• Decentralized AI, Identity, & Real World Assets (RWA)

Benefits:
• ₹80,00,000+ ($100,000+) Global prize pool & protocol bounties.
• Complete food, swag, and hardware kit provided.
• Top VC office hours and angel investment opportunities.""",
            direct_registration_url="https://ethindia.co",
            official_website_url="https://devfolio.co",
            prize_or_stipend_amount=8000000.0,
            prize_currency="INR",
            prize_description="₹80,00,000+ ($100K) Global Prize Pool & Bounties",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=24),
            start_date=now + timedelta(days=35),
            end_date=now + timedelta(days=37),
            eligibility_education=["Undergraduate", "Postgraduate", "Recent Graduate"],
            eligibility_criteria=[
                "Open to all developers, designers, and students globally",
                "Team sizes: 1 to 4 members",
                "Applications screened on GitHub profile, past projects, and builder curiosity"
            ],
            skills_required=["Solidity", "TypeScript", "React", "Rust", "Web3.js", "Python"],
            tags=["Web3", "Ethereum", "Bengaluru", "Devfolio", "Top Tier"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=97,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Devfolio Partner",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Direct API verified by Devfolio ecosystem",
                    "Venue confirmed at KTPO Bengaluru",
                    "Prior 5 editions verified with 100% prize disbursement"
                ]
            },
            source_platform="Devfolio",
            source_url="https://ethindia.co",
            views_count=5210,
            clicks_count=2140,
            applications_count=890,
            is_featured=True
        ),
        Opportunity(
            slug="google-summer-of-code-2026",
            title="Google Summer of Code (GSoC) 2026",
            organizer="Google Open Source Programs Office",
            organizer_logo="https://summerofcode.withgoogle.com/static/images/gsoc-logo.svg",
            category="fellowship",
            mode="online",
            location="Virtual / Global Remote",
            short_description="An international program bringing student developers into open source software development with stipends and 1-on-1 industry mentorship.",
            full_description="""Google Summer of Code (GSoC) is a global, online mentoring program designed to introduce new contributors to open source software development. Contributors work with an open source organization on a 12+ week programming project under the guidance of mentors.

Participating Organizations:
• Linux Foundation, Apache Software Foundation, Python Software Foundation
• TensorFlow, OpenCV, Mozilla, KDE, Wikimedia, Django

Compensation & Perks:
• Medium/Large project stipends (~$3,000 - $6,000 USD adjusted for India Purchasing Power Parity).
• Certificate of completion signed by Google Open Source.
• Strong alumni network and direct visibility for Google hiring.""",
            direct_registration_url="https://summerofcode.withgoogle.com",
            official_website_url="https://opensource.google",
            prize_or_stipend_amount=350000.0,
            prize_currency="INR",
            prize_description="$3,000+ USD (~₹2,50,000 - ₹5,00,000) Stipend",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=32),
            start_date=now + timedelta(days=60),
            end_date=now + timedelta(days=150),
            eligibility_education=["Undergraduate", "Postgraduate", "Recent Graduate"],
            eligibility_criteria=[
                "At least 18 years of age at registration",
                "Eligible to work in country of residence",
                "Must be a beginner or early contributor to the target open source organization"
            ],
            skills_required=["Python", "C++", "Rust", "Git", "System Design", "Open Source"],
            tags=["Google", "Open Source", "Global Fellowship", "Prestigious"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=99,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Google Domain",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Authenticated with google.com domain certificate",
                    "Official GSoC 2026 timeline and archive verified",
                    "Zero fee global mentorship stipend confirmed"
                ]
            },
            source_platform="Official Partner",
            source_url="https://summerofcode.withgoogle.com",
            views_count=8920,
            clicks_count=4210,
            applications_count=1350,
            is_featured=True
        ),
        Opportunity(
            slug="flipkart-grid-7-robotics-software",
            title="Flipkart GRiD 7.0 — Software Development & AI Track",
            organizer="Flipkart Talent & Engineering",
            organizer_logo="/logos/flipkart.svg",
            category="coding_contest",
            mode="online",
            location="All India Engineering Campuses (Virtual)",
            short_description="Flipkart's flagship campus competition giving tech students an opportunity to solve real e-commerce challenges with Pre-Placement Interviews (PPIs).",
            full_description="""Flipkart GRiD is Flipkart's Flagship Engineering Campus Challenge offering students the opportunity to tackle microservices scalability, high-throughput inventory routing, and Generative AI agents for commerce.

Tracks:
1. Software Development Track (Scalable distributed services)
2. GenAI & Conversational Shopping Assistants Track
3. Robotics & Automated Guided Vehicles (AGV) Track

Rewards & Career Outcomes:
• ₹5,00,000 Cash Prize Pool for Top 3 National Teams.
• Direct Pre-Placement Interviews (PPI) for Software Development Engineer (SDE-1) with 32 LPA package.
• Flipkart tech leadership mentorship and hardware goodies.""",
            direct_registration_url="https://unstop.com/competitions/flipkart-grid",
            official_website_url="https://flipkartcareers.com",
            prize_or_stipend_amount=500000.0,
            prize_currency="INR",
            prize_description="₹5,00,000 Cash Prize + SDE-1 PPIs (32 LPA)",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=12),
            start_date=now + timedelta(days=15),
            end_date=now + timedelta(days=35),
            eligibility_education=["Undergraduate", "Postgraduate"],
            eligibility_criteria=[
                "Open to B.Tech / B.E. / M.Tech / Dual Degree students (Batches of 2025, 2026, 2027)",
                "Team size: 1 - 3 members from the same institute",
                "Cross-branch teams permitted"
            ],
            skills_required=["Data Structures", "Java", "Python", "System Design", "Algorithms"],
            tags=["Flipkart", "Unstop", "SDE-1", "PPI", "Competitive"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=96,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Verified Unstop Campus Feed",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Direct integration with Flipkart University Relations",
                    "Active registration endpoint confirmed on Unstop",
                    "Authentic placement fast-track verified"
                ]
            },
            source_platform="Unstop",
            source_url="https://unstop.com/competitions/flipkart-grid",
            views_count=6410,
            clicks_count=3120,
            applications_count=1020,
            is_featured=False
        ),
        Opportunity(
            slug="google-graduate-software-engineer-2026",
            title="Google — Graduate Software Engineer (Full-Time) 2026 Batch",
            organizer="Google Engineering",
            organizer_logo="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png",
            category="job",
            mode="in-person",
            location="Bengaluru / Hyderabad, India",
            short_description="Full-time software engineering role for graduating seniors and recent graduates to build scalable distributed systems, search, and cloud infrastructure.",
            full_description="""Join Google as a Graduate Software Engineer. As an engineer at Google, you will work on our core products and services alongside world-class engineers.

Key Responsibilities:
• Design, implement, and deploy high-performance software modules.
• Work with distributed storage systems, high-throughput microservices, and AI models.
• Optimize latency, throughput, and system resilience.

Compensation & Benefits:
• ₹25,00,000 - ₹38,00,000 CTC per annum (Base + Performance Bonus + GSUs).
• Comprehensive health insurance, relocation support, and daily gourmet meals.""",
            direct_registration_url="https://careers.google.com/jobs/results/",
            official_website_url="https://careers.google.com",
            prize_or_stipend_amount=3000000.0,
            prize_currency="INR",
            prize_description="₹25,00,000 - ₹38,00,000 CTC / annum",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=20),
            start_date=now + timedelta(days=90),
            end_date=now + timedelta(days=365),
            eligibility_education=["Undergraduate", "Postgraduate", "Recent Graduate"],
            eligibility_criteria=[
                "B.Tech / M.Tech / Dual Degree in Computer Science, IT, or related technical disciplines",
                "Graduating batch of 2025 or 2026",
                "Strong foundational proficiency in Data Structures, Algorithms, and Object-Oriented Design"
            ],
            skills_required=["C++", "Java", "Python", "Data Structures", "Algorithms", "System Design"],
            tags=["Google", "Full-Time", "SDE", "Campus Hiring", "Top Tier"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=99,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Google Careers Portal",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Direct careers.google.com domain verified",
                    "Official hiring requisition confirmed",
                    "Zero fee verified"
                ]
            },
            source_platform="Official Partner",
            source_url="https://careers.google.com",
            views_count=7820,
            clicks_count=4120,
            applications_count=1290,
            is_featured=True
        ),
        Opportunity(
            slug="microsoft-software-development-engineer-fulltime",
            title="Microsoft — Software Development Engineer (SDE-1 Full-Time)",
            organizer="Microsoft India Development Center",
            organizer_logo="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
            category="job",
            mode="hybrid",
            location="Hyderabad / Bengaluru / Noida, India",
            short_description="Join Microsoft Azure, Office 365, and AI platform teams as a full-time SDE-1 building cloud services that empower millions worldwide.",
            full_description="""Microsoft is hiring full-time Software Development Engineers for our India Development Center (IDC).

Role Details:
• Architect, implement, and monitor cloud-scale features in Azure, Microsoft 365, and Developer Tools.
• Collaborate with product managers, UX researchers, and senior architects in an agile setting.

Compensation Package:
• ₹28,00,000 - ₹44,00,000 CTC per annum (Base + Target Bonus + Stock Grants).
• Wellness allowance, flexible hybrid work model, and tuition reimbursement.""",
            direct_registration_url="https://careers.microsoft.com",
            official_website_url="https://microsoft.com",
            prize_or_stipend_amount=3600000.0,
            prize_currency="INR",
            prize_description="₹28,00,000 - ₹44,00,000 CTC / annum",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=26),
            start_date=now + timedelta(days=75),
            end_date=now + timedelta(days=365),
            eligibility_education=["Undergraduate", "Postgraduate"],
            eligibility_criteria=[
                "B.Tech / M.Tech in CS, IT, ECE or equivalent technical degrees",
                "Graduation year: 2025 or 2026",
                "Minimum CGPA: 7.0 / 10"
            ],
            skills_required=["C#", "C++", "Java", "Python", "Cloud Architecture", "Distributed Systems"],
            tags=["Microsoft", "Full-Time", "Cloud", "Azure", "IDC"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=98,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Microsoft Careers Portal",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Microsoft domain authentication confirmed",
                    "Official IDC campus hiring pipeline verified"
                ]
            },
            source_platform="Official Partner",
            source_url="https://careers.microsoft.com",
            views_count=6540,
            clicks_count=3410,
            applications_count=980,
            is_featured=False
        ),
        Opportunity(
            slug="razorpay-associate-backend-engineer",
            title="Razorpay — Associate Backend Engineer (FinTech Core)",
            organizer="Razorpay Payments",
            organizer_logo="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
            category="job",
            mode="in-person",
            location="Bengaluru, India",
            short_description="Architect mission-critical payment gateways, ledger engines, and neo-banking APIs handling over $100 Billion in annualized transaction volume.",
            full_description="""Razorpay is India's leading full-stack financial solutions company. We are looking for Associate Backend Engineers to join our Core Payments & Banking infrastructure teams in Bengaluru.

Key Responsibilities:
• Build resilient microservices with 99.999% uptime guarantees.
• Optimize SQL queries, database indexing, and Redis caching for millions of concurrent checkouts.

Compensation:
• ₹18,00,000 - ₹24,00,000 CTC per annum + ESOPs.""",
            direct_registration_url="https://razorpay.com/jobs",
            official_website_url="https://razorpay.com",
            prize_or_stipend_amount=2100000.0,
            prize_currency="INR",
            prize_description="₹18,00,000 - ₹24,00,000 CTC / annum",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=16),
            start_date=now + timedelta(days=45),
            end_date=now + timedelta(days=365),
            eligibility_education=["Undergraduate", "Postgraduate", "Recent Graduate"],
            eligibility_criteria=[
                "B.Tech / B.E. / MCA in Computer Science or related fields",
                "Solid grasp of Go, Python, or Java and Relational Databases",
                "Passionate about high-throughput FinTech engineering"
            ],
            skills_required=["Go", "Python", "PostgreSQL", "Redis", "Kafka", "Docker"],
            tags=["Razorpay", "FinTech", "Backend", "Full-Time", "Bengaluru"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=97,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Razorpay Careers",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Official razorpay.com domain verified",
                    "Core FinTech team opening authenticated"
                ]
            },
            source_platform="Official Partner",
            source_url="https://razorpay.com/jobs",
            views_count=4310,
            clicks_count=2180,
            applications_count=640,
            is_featured=False
        ),
        Opportunity(
            slug="amazon-wow-mentorship-internship-2026",
            title="Amazon WOW India — Mentorship & SDE Internship 2026",
            organizer="Amazon India Engineering",
            organizer_logo="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
            category="internship",
            mode="hybrid",
            location="Bengaluru / Hyderabad / Remote",
            short_description="A career initiative designed to mentor female engineering students and fast-track them into 6-month Software Development Internships.",
            full_description="""Amazon WOW (Women Out Work) is a networking and skill architecture platform offering women engineering students across India direct interaction with Amazon leaders, technical workshops, and direct fast-track tests for 6-month SDE Internships.

Internship Highlights:
• Monthly stipend of ₹80,000 to ₹1,10,000.
• 6-month winter/summer internship duration.
• High full-time conversion rate to SDE-1 based on project review.
• 1-on-1 mentorship with Amazon Senior SDEs and Engineering Managers.""",
            direct_registration_url="https://amazonwowindia.splashthat.com",
            official_website_url="https://amazon.jobs",
            prize_or_stipend_amount=80000.0,
            prize_currency="INR",
            prize_description="₹80,000 - ₹1,10,000 / month Stipend",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=9),
            start_date=now + timedelta(days=40),
            end_date=now + timedelta(days=220),
            eligibility_education=["Undergraduate", "Postgraduate"],
            eligibility_criteria=[
                "Female engineering students pursuing Bachelor's or Master's degrees in CS/IT/Circuital branches",
                "Graduation Batches: 2026 and 2027",
                "Minimum CGPA of 6.5 or 65% aggregate"
            ],
            skills_required=["Data Structures", "Java", "C++", "Object Oriented Design", "Python"],
            tags=["Amazon", "Internship", "Women in Tech", "High Stipend", "SDE"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=97,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Amazon Talent Acquisition Portal",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Official Amazon recruitment splash page verified",
                    "Direct assessment links provided through official portal",
                    "Stipend figures confirmed via Amazon HR standards"
                ]
            },
            source_platform="Official Partner",
            source_url="https://amazon.jobs",
            views_count=4890,
            clicks_count=2310,
            applications_count=780,
            is_featured=False
        ),
        Opportunity(
            slug="reliance-foundation-stem-scholarship-2026",
            title="Reliance Foundation Undergraduate STEM Scholarship 2026",
            organizer="Reliance Foundation",
            organizer_logo="https://www.reliancefoundation.org/sites/default/files/logo_0.png",
            category="scholarship",
            mode="online",
            location="All India (Financial Grant)",
            short_description="Prestigious merit-cum-means scholarship supporting up to 5,000 undergraduate engineering and STEM students across India.",
            full_description="""The Reliance Foundation Undergraduate Scholarships aim to support meritorious students from all corners of India to pursue undergraduate education in Engineering, Technology, Computing, and Allied Sciences.

Scholarship Grant:
• Up to ₹2,00,000 grant over the duration of the degree course.
• Access to leadership workshops, industry alumni networks, and volunteering forums.
• 5,000 scholarships awarded annually across India.""",
            direct_registration_url="https://www.scholarships.reliancefoundation.org",
            official_website_url="https://www.reliancefoundation.org",
            prize_or_stipend_amount=200000.0,
            prize_currency="INR",
            prize_description="Up to ₹2,00,000 Total Degree Grant",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=22),
            start_date=now + timedelta(days=45),
            end_date=now + timedelta(days=1200),
            eligibility_education=["Undergraduate"],
            eligibility_criteria=[
                "First-year undergraduate students enrolled in a recognized full-time degree program in India",
                "Minimum 60% in Class 12 board examination",
                "Household annual income less than ₹15 Lakhs (priority given to under ₹2.5 Lakhs)"
            ],
            skills_required=["STEM Aptitude", "Academic Excellence", "Leadership"],
            tags=["Scholarship", "Reliance", "STEM", "Financial Grant", "Undergrad"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=95,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Foundation Portal",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Direct portal certified on reliancefoundation.org",
                    "National newspaper notices and scholarship guidelines verified",
                    "Direct bank transfer (DBT) grant disbursement verified"
                ]
            },
            source_platform="Official Partner",
            source_url="https://www.scholarships.reliancefoundation.org",
            views_count=3120,
            clicks_count=1450,
            applications_count=520,
            is_featured=False
        ),
        Opportunity(
            slug="kaggle-ai-grand-prix-reasoning-challenge",
            title="Kaggle AI Grand Prix: LLM Reasoning & Code Generation",
            organizer="Google DeepMind & Kaggle",
            organizer_logo="https://www.kaggle.com/static/images/site-logo.svg",
            category="coding_contest",
            mode="online",
            location="Global Virtual",
            short_description="Benchmark competitive programming models with automated reasoning in a $50,000 global machine learning competition.",
            full_description="""Can Large Language Models solve complex competitive programming problems with verifiable test suites? In this Kaggle competition hosted in partnership with Google DeepMind, build novel reasoning agent architectures that output accurate, time-optimal code solutions.

Evaluation Metric:
• Pass@1 accuracy on unseen hidden test cases.
• Execution time within sandbox CPU/GPU limits.

Prizes:
• 1st Place: $20,000 USD
• 2nd Place: $12,000 USD
• 3rd Place: $8,000 USD
• 4th - 10th Place: $10,000 USD shared + Google Cloud TPU credits""",
            direct_registration_url="https://www.kaggle.com/competitions/llm-reasoning-grand-prix",
            official_website_url="https://kaggle.com",
            prize_or_stipend_amount=4200000.0,
            prize_currency="INR",
            prize_description="$50,000 USD (~₹42 Lakhs) + Cloud Credits",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=15),
            start_date=now + timedelta(days=2),
            end_date=now + timedelta(days=45),
            eligibility_education=["Undergraduate", "Postgraduate", "Recent Graduate"],
            eligibility_criteria=[
                "Open to all Kaggle registered members worldwide",
                "Individual or team entries (max 4 members per team)",
                "Open source model weights and reproduction scripts mandatory for prize eligibility"
            ],
            skills_required=["Python", "PyTorch", "Transformers", "LLMs", "Algorithms", "Evaluation"],
            tags=["Kaggle", "Machine Learning", "DeepMind", "GenAI", "Global"],
            verification_status="VERIFIED_OFFICIAL",
            trust_score=99,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Official Kaggle Verification",
                "verified_by": "ORBINEX Source Intelligence",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Kaggle verified API token verified",
                    "Google DeepMind co-sponsorship verified",
                    "Automated leaderboard sandbox tested"
                ]
            },
            source_platform="Devpost",
            source_url="https://kaggle.com",
            views_count=4120,
            clicks_count=1920,
            applications_count=610,
            is_featured=False
        ),
        # Seed an item under review to showcase admin verification queue & reviewer capabilities
        Opportunity(
            slug="global-campus-ai-sprint-2026",
            title="Global Campus AI Sprint 2026 (Community Submitted)",
            organizer="OpenTech Student Collective",
            organizer_logo=None,
            category="hackathon",
            mode="online",
            location="Virtual Discord",
            short_description="Student-organized weekend hackathon exploring open models and agent workflows with sponsor bounties.",
            full_description="""A 48-hour student hackathon focused on building autonomous agent tools, Discord bots, and developer productivity plugins. Organizers are currently finalising enterprise cloud credits with partners.""",
            direct_registration_url="https://opentech-students.dev/hack",
            official_website_url="https://opentech-students.dev",
            prize_or_stipend_amount=150000.0,
            prize_currency="INR",
            prize_description="₹1,50,000 Estimated Prize Pool",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=28),
            start_date=now + timedelta(days=32),
            end_date=now + timedelta(days=34),
            eligibility_education=["Undergraduate", "High School"],
            eligibility_criteria=["Open to all student builders"],
            skills_required=["Python", "JavaScript", "AI"],
            tags=["Community", "Student Run", "Weekend Hack"],
            verification_status="UNDER_REVIEW",
            trust_score=68,
            verification_evidence={
                "domain_verified": False,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Community User Submission",
                "verified_by": "ORBINEX Automated Crawler",
                "last_checked_iso": now.isoformat(),
                "checklist": [
                    "Awaiting official sponsor letter confirmation",
                    "Domain registration less than 60 days old",
                    "Registration link responsive"
                ]
            },
            source_platform="Partner Submission",
            source_url="https://opentech-students.dev",
            views_count=320,
            clicks_count=85,
            applications_count=14,
            is_featured=False
        ),
        # Seed duplicate opportunity to showcase deduplication detection and admin merge engine!
        Opportunity(
            slug="smart-india-hackathon-sih-2026-duplicate",
            title="Smart India Hackathon (SIH) 2026 National Competition",
            organizer="Ministry of Education AICTE Cell",
            organizer_logo="https://sih.gov.in/img1/SIH2024-logo.png",
            category="hackathon",
            mode="hybrid",
            location="All India Centers",
            short_description="Duplicate entry detected from secondary feed for SIH 2026 with identical registration portal.",
            full_description="""Automated duplicate ingest from external aggregator portal.""",
            direct_registration_url="https://sih.gov.in",
            official_website_url="https://sih.gov.in",
            prize_or_stipend_amount=1000000.0,
            prize_currency="INR",
            prize_description="₹1,00,000 per Problem Statement",
            is_free=True,
            fee_amount=0.0,
            deadline=now + timedelta(days=18),
            start_date=now + timedelta(days=25),
            end_date=now + timedelta(days=27),
            eligibility_education=["Undergraduate", "Postgraduate"],
            eligibility_criteria=["College students"],
            skills_required=["Python", "React", "AI/ML"],
            tags=["AICTE", "SIH"],
            verification_status="UNDER_REVIEW",
            trust_score=85,
            verification_evidence={
                "domain_verified": True,
                "ssl_secure": True,
                "registration_link_tested": True,
                "source_credibility": "Secondary Feed Aggregator",
                "verified_by": "ORBINEX Deduplication Engine",
                "last_checked_iso": now.isoformat(),
                "checklist": ["High similarity with primary record #1 (SIH 2026)"]
            },
            is_duplicate=True,
            canonical_id=1,
            source_platform="Unstop",
            source_url="https://sih.gov.in",
            views_count=45,
            clicks_count=12,
            applications_count=2,
            is_featured=False
        )
    ]
    existing_slugs = {o.slug for o in db.query(Opportunity).all()}
    to_add = [o for o in opps if o.slug not in existing_slugs]
    if to_add:
        db.add_all(to_add)
        db.commit()

    # 5. Seed Duplicate Log for Admin Merging
    if db.query(OpportunityDuplicate).count() == 0:
        dup_log = OpportunityDuplicate(
            primary_id=1,
            duplicate_id=9,
            similarity_score=0.94,
            detection_reason="94% lexical and organizer match; identical official registration URL (sih.gov.in)",
            status="pending_review"
        )
        db.add(dup_log)
        db.commit()

    # 6. Seed Application Tracker with Real Interactive Stages for Aarav Sharma
    if db.query(ApplicationTracker).count() == 0:
        track1 = ApplicationTracker(
            user_id=1,
            opportunity_id=1,  # SIH 2026
            status="APPLIED",
            applied_date=now - timedelta(days=3),
            deadline=now + timedelta(days=18),
            follow_up_date=now + timedelta(days=5),
            notes="Internal college round shortlisted! Team 'OrbitBuilders' nominated by college SPOC. Working on disaster management problem statement #1428.",
            submission_url="https://github.com/aarav-sharma-dev/sih-2026-disaster-ai",
            match_score=96
        )
        db.add(track1)
        db.commit()
        db.refresh(track1)

        # Tasks for SIH
        sih_tasks = [
            ApplicationTask(application_tracker_id=track1.id, title="Submit 1-page solution PPT to College SPOC", is_completed=True, due_date=now - timedelta(days=2), priority="high"),
            ApplicationTask(application_tracker_id=track1.id, title="Finalize IoT telemetry simulator backend using FastAPI", is_completed=False, due_date=now + timedelta(days=7), priority="high"),
            ApplicationTask(application_tracker_id=track1.id, title="Test offline map synchronization on React Native demo", is_completed=False, due_date=now + timedelta(days=12), priority="medium")
        ]
        db.add_all(sih_tasks)

        track2 = ApplicationTracker(
            user_id=1,
            opportunity_id=2,  # ETHIndia 2026
            status="INTERVIEW_ROUND",
            applied_date=now - timedelta(days=7),
            deadline=now + timedelta(days=24),
            follow_up_date=now + timedelta(days=2),
            notes="Devfolio application accepted into Round 2 Review! Hacker RSVP confirmed. Working with teammate on Account Abstraction paymaster design.",
            submission_url="https://devfolio.co/submissions/ethindia-orbit",
            match_score=92
        )
        db.add(track2)
        db.commit()
        db.refresh(track2)

        eth_tasks = [
            ApplicationTask(application_tracker_id=track2.id, title="Confirm Hacker Pass & travel details on Devfolio dashboard", is_completed=True, due_date=now - timedelta(days=1), priority="high"),
            ApplicationTask(application_tracker_id=track2.id, title="Prototype ERC-4337 smart account bundler scripts", is_completed=False, due_date=now + timedelta(days=10), priority="medium")
        ]
        db.add_all(eth_tasks)

        track3 = ApplicationTracker(
            user_id=1,
            opportunity_id=3,  # GSoC 2026
            status="SAVED",
            applied_date=None,
            deadline=now + timedelta(days=32),
            follow_up_date=now + timedelta(days=6),
            notes="Targeting Python Software Foundation and TensorFlow. Forked repository and set up local development environment.",
            submission_url=None,
            match_score=94
        )
        db.add(track3)
        db.commit()
        db.refresh(track3)

        gsoc_tasks = [
            ApplicationTask(application_tracker_id=track3.id, title="Pick 2 beginner-friendly 'good first issue' tickets on GitHub", is_completed=True, due_date=now - timedelta(days=4), priority="high"),
            ApplicationTask(application_tracker_id=track3.id, title="Submit pull request with unit test coverage", is_completed=False, due_date=now + timedelta(days=8), priority="high"),
            ApplicationTask(application_tracker_id=track3.id, title="Draft GSoC project proposal with timeline milestones", is_completed=False, due_date=now + timedelta(days=20), priority="medium")
        ]
        db.add_all(gsoc_tasks)
        db.commit()
    print("ORBINEX database successfully populated with rich opportunities, sources, and tracker data.")
    db.close()

if __name__ == "__main__":
    seed_database()
