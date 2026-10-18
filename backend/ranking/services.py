"""
Transparent Scoring Engine for StageLink Role Matching & Candidate Ranking.
Evaluates candidate compatibility against specific role requirements.
"""

# Configurable default scoring weights (sums to 100)
DEFAULT_WEIGHTS = {
    'skills': 30.0,
    'portfolio': 25.0,
    'experience': 15.0,
    'language': 10.0,
    'availability': 10.0,
    'location': 10.0,
}

# Protected attributes strictly barred from ranking calculation
PROTECTED_ATTRIBUTES = {
    'race', 'ethnicity', 'religion', 'disability', 'gender',
    'sexual_orientation', 'attractiveness', 'facial_features',
    'subscription_tier', 'paid_status'
}

def calculate_role_match_score(candidate_profile, role_requirements, opportunity_context=None, weights=None):
    """
    Calculate an explainable, normalized match score out of 100
    between a candidate's profile and a specific casting role.
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS.copy()

    # 1. Profile completeness check
    missing_fields = []
    if not candidate_profile.get('skills'):
        missing_fields.append('skills')
    if not candidate_profile.get('portfolio'):
        missing_fields.append('portfolio_showreel')
    if candidate_profile.get('years_of_experience') is None:
        missing_fields.append('years_of_experience')
    if not candidate_profile.get('languages'):
        missing_fields.append('languages')
    if not candidate_profile.get('location'):
        missing_fields.append('location')

    # If critical fields are missing, return insufficient data state
    if len(missing_fields) >= 3:
        return {
            'total_score': 0.0,
            'status': 'insufficient_data',
            'confidence_level': 'low',
            'missing_fields': missing_fields,
            'improvement_suggestions': [
                f"Complete your {field.replace('_', ' ')} to qualify for transparent scoring assessment."
                for field in missing_fields
            ],
            'calculation_summary': 'Not enough information to calculate a meaningful score without penalizing candidate.',
            'breakdowns': []
        }

    breakdowns = []
    total_score = 0.0

    # -------------------------------------------------------------
    # 1. Skills & Role-Specific Abilities (30 points)
    # -------------------------------------------------------------
    cand_skills = set(s.strip().lower() for s in candidate_profile.get('skills', []))
    req_skills = set(s.strip().lower() for s in role_requirements.get('required_skills', []))
    max_pts = weights['skills']

    if req_skills:
        matched = cand_skills.intersection(req_skills)
        ratio = len(matched) / len(req_skills)
        pts = round(ratio * max_pts, 1)
        evidence = f"Matched {len(matched)} of {len(req_skills)} required skills ({', '.join(sorted(matched)) if matched else 'None'})."
        missing = f"Missing required skills: {', '.join(sorted(req_skills - cand_skills))}" if (req_skills - cand_skills) else None
    else:
        pts = max_pts
        evidence = "No specific skill prerequisites declared for role; full baseline points awarded."
        missing = None

    breakdowns.append({
        'criterion_key': 'skills',
        'criterion_name': 'Required Skills & Abilities',
        'max_points': max_pts,
        'points_awarded': pts,
        'evidence_used': evidence,
        'missing_or_uncertainty': missing,
    })
    total_score += pts

    # -------------------------------------------------------------
    # 2. Portfolio, Showreel & Work Samples (25 points)
    # -------------------------------------------------------------
    portfolio = candidate_profile.get('portfolio', {})
    max_pts = weights['portfolio']
    pts = 0.0
    evidence_parts = []
    missing_parts = []

    if portfolio.get('video_reel') or portfolio.get('video_audition_url') or candidate_profile.get('video_audition_url'):
        pts += max_pts * 0.50
        evidence_parts.append("Verified video showreel / audition tape")
    else:
        missing_parts.append("No active video reel provided")

    if portfolio.get('headshots'):
        pts += max_pts * 0.30
        count = len(portfolio['headshots'])
        evidence_parts.append(f"{count} theatrical headshot{'s' if count > 1 else ''}")
    else:
        missing_parts.append("No professional headshots on file")

    if portfolio.get('resume_url') or portfolio.get('audio_samples'):
        pts += max_pts * 0.20
        evidence_parts.append("Professional CV / Audio samples")

    pts = round(min(pts, max_pts), 1)
    breakdowns.append({
        'criterion_key': 'portfolio',
        'criterion_name': 'Portfolio & Work Samples',
        'max_points': max_pts,
        'points_awarded': pts,
        'evidence_used': '; '.join(evidence_parts) if evidence_parts else "No verified materials submitted",
        'missing_or_uncertainty': '; '.join(missing_parts) if missing_parts else None,
    })
    total_score += pts

    # -------------------------------------------------------------
    # 3. Relevant Experience & Screen Credits (15 points)
    # -------------------------------------------------------------
    cand_years = candidate_profile.get('years_of_experience', 0)
    req_years = role_requirements.get('min_experience_years', 2)
    credits_list = candidate_profile.get('experience_credits', [])
    max_pts = weights['experience']

    if cand_years >= req_years:
        ratio = min(1.0, 0.85 + max(0.0, cand_years - req_years) * 0.1 + min(len(credits_list), 5) * 0.05)
        pts = round(max_pts * ratio, 1)
        evidence = f"Has {cand_years} years on-screen experience (minimum required: {req_years} years)."
        missing = None
    elif cand_years > 0:
        ratio = max(0.2, (cand_years / max(1, req_years)) * 0.75)
        pts = round(max_pts * ratio, 1)
        evidence = f"Has {cand_years} years experience against {req_years} required."
        missing = f"Below preferred role experience threshold by {req_years - cand_years} years."
    else:
        pts = round(max_pts * 0.2, 1)
        evidence = "Entry-level candidate profile with emerging credits."
        missing = "No verified film/theatrical screen credits listed."

    breakdowns.append({
        'criterion_key': 'experience',
        'criterion_name': 'Relevant Experience & Credits',
        'max_points': max_pts,
        'points_awarded': pts,
        'evidence_used': evidence,
        'missing_or_uncertainty': missing,
    })
    total_score += pts

    # -------------------------------------------------------------
    # 4. Language & Communication (10 points)
    # -------------------------------------------------------------
    cand_langs = set(l.strip().lower() for l in candidate_profile.get('languages', []))
    req_langs = set(l.strip().lower() for l in role_requirements.get('required_languages', []))
    max_pts = weights['language']

    if req_langs:
        matched_langs = cand_langs.intersection(req_langs)
        ratio = len(matched_langs) / len(req_langs)
        pts = round(ratio * max_pts, 1)
        evidence = f"Speaks: {', '.join(sorted(cand_langs))}. Matched: {', '.join(sorted(matched_langs)) if matched_langs else 'None'}."
        missing = f"Missing languages: {', '.join(sorted(req_langs - cand_langs))}" if (req_langs - cand_langs) else None
    else:
        pts = max_pts
        evidence = f"No specific language constraint; candidate speaks {', '.join(sorted(cand_langs)) or 'English'}."
        missing = None

    breakdowns.append({
        'criterion_key': 'language',
        'criterion_name': 'Language Requirements',
        'max_points': max_pts,
        'points_awarded': pts,
        'evidence_used': evidence,
        'missing_or_uncertainty': missing,
    })
    total_score += pts

    # -------------------------------------------------------------
    # 5. Availability for Shooting Schedule (10 points)
    # -------------------------------------------------------------
    avail_status = str(candidate_profile.get('availability_status', '')).lower()
    max_pts = weights['availability']

    if 'available' in avail_status or 'open' in avail_status or not avail_status:
        pts = max_pts
        evidence = "Confirmed full project availability for production shoot window."
        missing = None
    elif 'limited' in avail_status or 'notice' in avail_status:
        pts = round(max_pts * 0.7, 1)
        evidence = "Conditionally available with advance scheduling notice."
        missing = "Subject to existing calendar engagements."
    else:
        pts = round(max_pts * 0.3, 1)
        evidence = f"Status reported as '{candidate_profile.get('availability_status')}'."
        missing = "May have scheduling overlap with production dates."

    breakdowns.append({
        'criterion_key': 'availability',
        'criterion_name': 'Shooting Availability',
        'max_points': max_pts,
        'points_awarded': pts,
        'evidence_used': evidence,
        'missing_or_uncertainty': missing,
    })
    total_score += pts

    # -------------------------------------------------------------
    # 6. Location & Travel Feasibility (10 points)
    # -------------------------------------------------------------
    cand_loc = str(candidate_profile.get('location', '')).lower()
    opp_loc = str((opportunity_context or {}).get('location', '')).lower()
    travel_covered = (opportunity_context or {}).get('travel_covered', True)
    max_pts = weights['location']

    is_local = any(token in opp_loc for token in cand_loc.split(',') if len(token.strip()) > 2)
    if is_local:
        pts = max_pts
        evidence = f"Local to shooting zone ({candidate_profile.get('location')}). Zero travel logistics."
        missing = None
    elif travel_covered:
        pts = round(max_pts * 0.85, 1)
        evidence = f"Candidate located in {candidate_profile.get('location')}; production covers travel & lodging."
        missing = "Requires travel coordination."
    else:
        pts = round(max_pts * 0.5, 1)
        evidence = f"Non-local ({candidate_profile.get('location')}) without production travel provision."
        missing = "Candidate must confirm self-funded travel."

    breakdowns.append({
        'criterion_key': 'location',
        'criterion_name': 'Location & Travel',
        'max_points': max_pts,
        'points_awarded': pts,
        'evidence_used': evidence,
        'missing_or_uncertainty': missing,
    })
    total_score += pts

    # Final summary
    total_score = round(min(total_score, 100.0), 1)
    confidence = 'high' if len(missing_fields) == 0 else 'medium'
    suggestions = []
    for b in breakdowns:
        if b['missing_or_uncertainty']:
            suggestions.append(f"Consider updating {b['criterion_name'].lower()} documentation to maximize score.")

    summary_items = [f"{b['criterion_name'].split()[0]} {int(b['points_awarded'])}/{int(b['max_points'])}" for b in breakdowns]
    calc_summary = f"Match score: {int(total_score)}/100 — " + ", ".join(summary_items)

    return {
        'total_score': total_score,
        'status': 'calculated',
        'confidence_level': confidence,
        'missing_fields': missing_fields,
        'improvement_suggestions': suggestions,
        'calculation_summary': calc_summary,
        'breakdowns': breakdowns,
    }
