import os
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from app.config import settings

def generate_pdf_report(
    scan_id: str,
    scan_type: str,
    company_name: str,
    opportunity_title: str,
    risk_score: float,
    risk_category: str,
    findings: list,
    recommendations: list,
    submitted_details: dict = None
) -> str:
    """
    Generates a professional cybersecurity audit report PDF.
    Returns the absolute path to the generated PDF.
    """
    filename = f"JOBTRUST_Report_{scan_id[:8]}_{datetime.datetime.now().strftime('%Y%m%d%H%M')}.pdf"
    pdf_path = os.path.join(settings.REPORT_DIR, filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    bold_style = ParagraphStyle(
        'BoldTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748B')
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>JOBTRUST</b> | RECRUITMENT FRAUD INTELLIGENCE", title_style),
            Paragraph(f"<b>REPORT ID:</b> {scan_id[:13]}<br/><b>DATE:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=2, spaceAfter=14))

    # 2. Executive Summary Block
    # Determine color badge
    if risk_score >= 80:
        badge_color = colors.HexColor('#DC2626') # Red
    elif risk_score >= 60:
        badge_color = colors.HexColor('#EA580C') # Orange
    elif risk_score >= 30:
        badge_color = colors.HexColor('#D97706') # Amber
    else:
        badge_color = colors.HexColor('#16A34A') # Green

    summary_data = [
        [
            Paragraph(f"<b>Target Entity:</b> {company_name or 'Not specified'}<br/><b>Opportunity Title:</b> {opportunity_title or 'Recruitment Analysis'}<br/><b>Analysis Type:</b> {scan_type.upper()}", body_style),
            Paragraph(f"<font color='white'><b>RISK ASSESSMENT SCORE</b><br/><font size='22'><b>{risk_score:.0f}/100</b></font><br/>{risk_category.upper()}</font>", ParagraphStyle('ScoreBadge', parent=body_style, alignment=1, textColor=colors.white))
        ]
    ]
    summary_table = Table(summary_data, colWidths=[360, 180])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (1, 0), (1, 0), badge_color),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 14))

    # 3. Findings Table
    story.append(Paragraph("<b>THREAT & RISK EVIDENCE FINDINGS</b>", section_style))
    findings_rows = [
        [
            Paragraph("<b>SEVERITY</b>", bold_style),
            Paragraph("<b>INDICATOR TYPE</b>", bold_style),
            Paragraph("<b>EVIDENCE & EXPLANATION</b>", bold_style),
            Paragraph("<b>SOURCE</b>", bold_style)
        ]
    ]

    for f in findings:
        sev = getattr(f, 'severity', 'INFO')
        f_type = getattr(f, 'finding_type', 'GENERAL')
        explanation = getattr(f, 'explanation', '')
        source = getattr(f, 'evidence_source', 'JOBTRUST Engine')

        sev_color = '#16A34A'
        if sev == 'CRITICAL':
            sev_color = '#DC2626'
        elif sev == 'HIGH':
            sev_color = '#EA580C'
        elif sev == 'MEDIUM':
            sev_color = '#D97706'

        findings_rows.append([
            Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", bold_style),
            Paragraph(f_type, body_style),
            Paragraph(explanation, body_style),
            Paragraph(source, body_style)
        ])

    findings_table = Table(findings_rows, colWidths=[70, 130, 240, 100])
    findings_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(findings_table)
    story.append(Spacer(1, 14))

    # 4. Recommended Actions
    story.append(Paragraph("<b>RECOMMENDED PROTECTIVE ACTIONS</b>", section_style))
    action_text = ""
    for idx, act in enumerate(recommendations, start=1):
        action_text += f"• <b>{act}</b><br/><br/>"
    story.append(Paragraph(action_text, body_style))
    story.append(Spacer(1, 10))

    # 5. Regulatory & Verification Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#E2E8F0'), spaceBefore=8, spaceAfter=8))
    disclaimer_text = (
        "<b>LEGAL & COMPLIANCE DISCLAIMER:</b> JOBTRUST is an automated experimental AI and cybersecurity risk intelligence platform. "
        "The risk score and associated findings represent probabilistic anomaly detection based on heuristic rules, NLP pattern classification, "
        "and public infrastructure intelligence. This report does not constitute a definitive legal accusation of fraud, nor does a low score guarantee absolute employer legitimacy. "
        "Job seekers are strongly encouraged to independently verify all employment opportunities through official corporate channels."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    return pdf_path
