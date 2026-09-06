from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet

def generate_pdf_report(location: str, indices: dict, risk_level: str, forecast: list) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Environmental Pollution Intelligence Report", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Location: {location}", styles["Normal"]))
    elements.append(Paragraph(f"Risk Level: {risk_level}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Pollution Indices", styles["Heading2"]))
    index_data = [["Index", "Value"]] + [[k, str(v)] for k, v in indices.items()]
    t = Table(index_data, colWidths=[200, 200])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))

    if forecast:
        elements.append(Paragraph("7-Day Forecast", styles["Heading2"]))
        forecast_data = [["Day", "Predicted Value"]] + [[str(i + 1), str(v)] for i, v in enumerate(forecast)]
        ft = Table(forecast_data, colWidths=[200, 200])
        ft.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(ft)

    doc.build(elements)
    return buffer.getvalue()
