const PDFDocument = require("pdfkit");
const HealthMetric = require("../models/HealthMetric.model");
const Medication = require("../models/Medication.model");
const Alert = require("../models/Alert.model");
const User = require("../models/User.model");

/**
 * Resolve the userId to export: patients can only export their own data,
 * providers can export any of their patients.
 */
const resolveUserId = (req) => {
  if (req.user.role === "patient") return req.user._id;
  return req.query.userId || req.user._id;
};

/**
 * Build date range from query params. Defaults to last 30 days.
 */
const buildDateRange = (query) => {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return { startDate, endDate };
};

/**
 * Format a metric value for display
 */
const formatValue = (metric) => {
  if (typeof metric.value === "object" && metric.value !== null) {
    if (metric.value.systolic != null) {
      return `${metric.value.systolic}/${metric.value.diastolic}`;
    }
    return JSON.stringify(metric.value);
  }
  return String(metric.value ?? "");
};

/**
 * GET /api/export/csv
 * Downloads health metrics + medication adherence as CSV.
 */
const exportCSV = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { startDate, endDate } = buildDateRange(req.query);

    const metrics = await HealthMetric.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    }).sort({ timestamp: 1 });

    const rows = [["Date", "Type", "Value", "Unit", "Source", "Notes"]];

    for (const m of metrics) {
      rows.push([
        new Date(m.timestamp).toISOString().split("T")[0],
        m.metricType,
        formatValue(m),
        m.unit || "",
        m.source || "",
        (m.notes || "").replace(/,/g, ";"),
      ]);
    }

    // Append medication adherence rows
    const meds = await Medication.find({ userId, isActive: true });
    for (const med of meds) {
      for (const log of med.adherenceLog || []) {
        const logDate = new Date(log.date);
        if (logDate >= startDate && logDate <= endDate) {
          rows.push([
            logDate.toISOString().split("T")[0],
            "medication",
            log.taken ? "taken" : log.skipped ? "skipped" : "missed",
            med.name,
            med.dosage,
            (log.skipReason || "").replace(/,/g, ";"),
          ]);
        }
      }
    }

    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="medxi-health-report.csv"',
    );
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ message: "Failed to generate CSV" });
  }
};

/**
 * GET /api/export/pdf
 * Downloads a formatted PDF health report.
 */
const exportPDF = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { startDate, endDate } = buildDateRange(req.query);

    const [user, metrics, meds, alerts] = await Promise.all([
      User.findById(userId),
      HealthMetric.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate },
      }).sort({ timestamp: 1 }),
      Medication.find({ userId }),
      Alert.find({
        userId,
        isAcknowledged: false,
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const patientName = user
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : "Unknown Patient";

    const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");
    const reportDateRange = `${formatDate(startDate)} – ${formatDate(endDate)}`;

    // Compute per-metric summary: latest, avg, min, max
    const metricSummary = {};
    for (const m of metrics) {
      const raw =
        typeof m.value === "object" && m.value !== null
          ? m.value.systolic ?? null
          : Number(m.value);
      if (raw === null || isNaN(raw)) continue;
      if (!metricSummary[m.metricType]) {
        metricSummary[m.metricType] = { values: [], unit: m.unit || "" };
      }
      metricSummary[m.metricType].values.push(raw);
    }

    // Compute medication adherence %
    const medAdherence = meds
      .filter((med) => med.adherenceLog && med.adherenceLog.length > 0)
      .map((med) => {
        const logsInRange = med.adherenceLog.filter((l) => {
          const d = new Date(l.date);
          return d >= startDate && d <= endDate;
        });
        if (logsInRange.length === 0)
          return { name: med.name, dosage: med.dosage, adherence: "N/A" };
        const taken = logsInRange.filter((l) => l.taken).length;
        const pct = Math.round((taken / logsInRange.length) * 100);
        return { name: med.name, dosage: med.dosage, adherence: `${pct}%` };
      });

    // --- Build PDF ---
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="medxi-health-report.pdf"',
    );
    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("MEDXI Health Report", { align: "center" });
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#555")
      .text(`Patient: ${patientName}`, { align: "center" });
    doc.text(`Report Period: ${reportDateRange}`, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, {
      align: "center",
    });
    doc.moveDown(1);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.8);

    // Section 1: Patient Info
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000").text("1. Patient Information");
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica");
    if (user) {
      doc.text(`Name: ${patientName}`);
      doc.text(`Email: ${user.email}`);
      if (user.profile.dateOfBirth) {
        doc.text(`Date of Birth: ${formatDate(user.profile.dateOfBirth)}`);
      }
      if (user.profile.gender) doc.text(`Gender: ${user.profile.gender}`);
      if (user.profile.phone) doc.text(`Phone: ${user.profile.phone}`);
    }
    doc.moveDown(1);

    // Section 2: Health Metrics Summary
    doc.fontSize(14).font("Helvetica-Bold").text("2. Health Metrics Summary");
    doc.moveDown(0.4);

    const metricKeys = Object.keys(metricSummary);
    if (metricKeys.length === 0) {
      doc.fontSize(10).font("Helvetica").fillColor("#555").text("No health metrics recorded in this period.");
    } else {
      // Table header
      const colX = [50, 180, 270, 340, 410, 475];
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#000");
      doc.text("Metric", colX[0], doc.y, { continued: true, width: 120 });
      doc.text("Count", colX[1], doc.y - doc.currentLineHeight(), { continued: true, width: 80 });
      doc.text("Latest", colX[2], doc.y - doc.currentLineHeight(), { continued: true, width: 65 });
      doc.text("Avg", colX[3], doc.y - doc.currentLineHeight(), { continued: true, width: 65 });
      doc.text("Min", colX[4], doc.y - doc.currentLineHeight(), { continued: true, width: 60 });
      doc.text("Max", colX[5], doc.y - doc.currentLineHeight(), { width: 60 });
      doc.moveDown(0.2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#aaaaaa").lineWidth(0.5).stroke();
      doc.moveDown(0.3);

      doc.font("Helvetica").fontSize(9);
      for (const key of metricKeys) {
        const { values, unit } = metricSummary[key];
        const latest = values[values.length - 1];
        const avg = (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const suffix = unit ? ` ${unit}` : "";
        const y = doc.y;
        doc.text(key, colX[0], y, { continued: true, width: 120 });
        doc.text(String(values.length), colX[1], y - doc.currentLineHeight(), { continued: true, width: 80 });
        doc.text(`${latest}${suffix}`, colX[2], y - doc.currentLineHeight(), { continued: true, width: 65 });
        doc.text(`${avg}${suffix}`, colX[3], y - doc.currentLineHeight(), { continued: true, width: 65 });
        doc.text(`${min}${suffix}`, colX[4], y - doc.currentLineHeight(), { continued: true, width: 60 });
        doc.text(`${max}${suffix}`, colX[5], y - doc.currentLineHeight(), { width: 60 });
      }
    }
    doc.moveDown(1);

    // Section 3: Medication Adherence
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000").text("3. Medication Adherence");
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica");

    if (meds.length === 0) {
      doc.fillColor("#555").text("No medications on record.");
    } else if (medAdherence.length === 0) {
      for (const med of meds) {
        doc.fillColor("#000").text(`• ${med.name} ${med.dosage} — no adherence data`);
      }
    } else {
      for (const m of medAdherence) {
        doc.fillColor("#000").text(`• ${m.name} (${m.dosage}) — Adherence: ${m.adherence}`);
      }
      // Also list meds with no log
      for (const med of meds) {
        if (!medAdherence.find((m) => m.name === med.name)) {
          doc.fillColor("#000").text(`• ${med.name} (${med.dosage}) — Adherence: N/A`);
        }
      }
    }
    doc.moveDown(1);

    // Section 4: Active Alerts
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000").text("4. Active Alerts");
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica");

    if (alerts.length === 0) {
      doc.fillColor("#555").text("No active alerts in this period.");
    } else {
      for (const alert of alerts) {
        doc
          .fillColor("#000")
          .font("Helvetica-Bold")
          .text(`[${alert.severity.toUpperCase()}] ${alert.title}`, { continued: false });
        doc.font("Helvetica").fillColor("#333").text(alert.message);
        doc.fillColor("#888").text(formatDate(alert.createdAt));
        doc.moveDown(0.4);
      }
    }

    // Footer
    doc.moveDown(2);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#888")
      .text(`Generated by MEDXI on ${new Date().toLocaleDateString("en-GB")}`, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("PDF export error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
};

module.exports = { exportCSV, exportPDF };
