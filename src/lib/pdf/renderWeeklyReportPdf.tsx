import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToStream } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    backgroundColor: "#090d16",
    color: "#e2e8f0",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1f293d",
    borderBottomStyle: "solid",
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#06b6d4",
  },
  subtitle: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1f293d",
    borderBottomStyle: "solid",
    paddingBottom: 4,
  },
  gridRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f293d",
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
  },
  statLabel: {
    fontSize: 8,
    color: "#64748b",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
  },
  sessionCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f293d",
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  sessionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  studentName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#38bdf8",
  },
  durationText: {
    fontSize: 9,
    color: "#34d399",
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#94a3b8",
    marginTop: 3,
  },
  content: {
    fontSize: 9,
    color: "#e2e8f0",
  },
  difficultyText: {
    fontSize: 9,
    color: "#fca5a5",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 35,
    right: 35,
    fontSize: 8,
    color: "#475569",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#1f293d",
    borderTopStyle: "solid",
    paddingTop: 8,
  },
});

export interface WeeklyReportData {
  reportScope: string;
  startDate: string;
  endDate: string;
  totalStudents: number;
  totalHours: number;
  totalSessions: number;
  totalNotes: number;
  totalLabs: number;
  difficultiesSummary: Array<{ category: string; count: number }>;
  sessions: Array<{
    studentName: string;
    category: string;
    durationMinutes: number;
    startedAt: string;
    contentStudied: string;
    difficulties: string;
    nextSteps: string;
  }>;
}

function WeeklyReportDocument({ data }: { data: WeeklyReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CYBER // OS — WEEKLY ACADEMIC REPORT</Text>
          <Text style={styles.subtitle}>
            Scope: {data.reportScope} • Period: {data.startDate} to {data.endDate}
          </Text>
        </View>

        {/* Aggregate Stats */}
        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL STUDY TIME</Text>
            <Text style={styles.statValue}>{data.totalHours} HRS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SESSIONS LOGGED</Text>
            <Text style={styles.statValue}>{data.totalSessions}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>NOTES CREATED</Text>
            <Text style={styles.statValue}>{data.totalNotes}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>LABS COMPLETED</Text>
            <Text style={styles.statValue}>{data.totalLabs}</Text>
          </View>
        </View>

        {/* Flagged Difficulties Summary */}
        <Text style={styles.sectionTitle}>TOP FLAGGED DIFFICULTIES THIS WEEK</Text>
        {data.difficultiesSummary.length === 0 ? (
          <Text style={{ fontSize: 9, color: "#64748b", marginBottom: 10 }}>
            No specific study difficulties were flagged during this period.
          </Text>
        ) : (
          <View style={{ marginBottom: 15 }}>
            {data.difficultiesSummary.map((item, i) => (
              <Text key={i} style={{ fontSize: 9, color: "#fbbf24", marginBottom: 2 }}>
                • {item.category}: {item.count} flagged struggle(s)
              </Text>
            ))}
          </View>
        )}

        {/* Detailed Sessions List */}
        <Text style={styles.sectionTitle}>STUDY SESSION REFLECTIONS</Text>
        {data.sessions.map((s, idx) => (
          <View key={idx} style={styles.sessionCard}>
            <View style={styles.sessionMeta}>
              <Text style={styles.studentName}>
                {s.studentName} ({s.category})
              </Text>
              <Text style={styles.durationText}>{s.durationMinutes} mins</Text>
            </View>

            <Text style={styles.label}>Studied:</Text>
            <Text style={styles.content}>{s.contentStudied || "N/A"}</Text>

            {s.difficulties ? (
              <View style={{ marginTop: 2 }}>
                <Text style={styles.label}>Struggles / Difficulties:</Text>
                <Text style={styles.difficultyText}>{s.difficulties}</Text>
              </View>
            ) : null}

            {s.nextSteps ? (
              <View style={{ marginTop: 2 }}>
                <Text style={styles.label}>Next Steps:</Text>
                <Text style={styles.content}>{s.nextSteps}</Text>
              </View>
            ) : null}
          </View>
        ))}

        <Text style={styles.footer}>
          CYBER // OS — Confidential Instructor Admin Report • Generated Server-Side
        </Text>
      </Page>
    </Document>
  );
}

export async function generateWeeklyReportPdfStream(data: WeeklyReportData) {
  return await renderToStream(<WeeklyReportDocument data={data} />);
}
