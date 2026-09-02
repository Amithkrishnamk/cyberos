import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToStream } from "@react-pdf/renderer";
import { NoteBlock } from "@/types";

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
    color: "#ffffff",
  },
  categoryBadge: {
    fontSize: 10,
    color: "#06b6d4",
    marginTop: 4,
  },
  metadataRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
    fontSize: 9,
    color: "#64748b",
  },
  metaItem: {
    backgroundColor: "#111827",
    padding: 4,
    borderRadius: 4,
  },
  block: {
    marginBottom: 10,
  },
  heading1: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 12,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1f293d",
    borderBottomStyle: "solid",
    paddingBottom: 4,
  },
  heading2: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#06b6d4",
    marginTop: 10,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f8fafc",
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#cbd5e1",
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#cbd5e1",
    paddingLeft: 10,
  },
  checklist: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#cbd5e1",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quote: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#a5f3fc",
    borderLeftWidth: 3,
    borderLeftColor: "#06b6d4",
    borderLeftStyle: "solid",
    paddingLeft: 10,
    marginVertical: 6,
  },
  codeCard: {
    backgroundColor: "#050811",
    borderWidth: 1,
    borderColor: "#1f293d",
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
  },
  codeText: {
    fontFamily: "Courier",
    fontSize: 9,
    color: "#34d399",
    lineHeight: 1.3,
  },
  cmdCard: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#06b6d4",
    borderStyle: "solid",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  cmdText: {
    fontFamily: "Courier",
    fontSize: 9,
    color: "#22d3ee",
    fontWeight: "bold",
  },
  vulnCard: {
    backgroundColor: "#14080a",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
  },
  vulnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cveText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fca5a5",
  },
  conceptCard: {
    backgroundColor: "#0b1c18",
    borderWidth: 1,
    borderColor: "#10b981",
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
  },
  conceptTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#34d399",
    marginBottom: 2,
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

export interface RenderNotePdfOptions {
  title: string;
  category: string;
  description?: string;
  icon?: string;
  masteryPercent?: number;
  timeStudiedMinutes?: number;
  tags?: string[];
  blocks: NoteBlock[];
}

function NoteDocument({ options }: { options: RenderNotePdfOptions }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {options.icon || "📝"} {options.title}
          </Text>
          <Text style={styles.categoryBadge}>CATEGORY: {options.category.toUpperCase()}</Text>

          {options.description ? (
            <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
              {options.description}
            </Text>
          ) : null}

          <View style={styles.metadataRow}>
            <Text style={styles.metaItem}>Mastery: {options.masteryPercent || 0}%</Text>
            <Text style={styles.metaItem}>Studied: {options.timeStudiedMinutes || 0} mins</Text>
            {options.tags && options.tags.length > 0 && (
              <Text style={styles.metaItem}>Tags: {options.tags.join(", ")}</Text>
            )}
          </View>
        </View>

        {/* Content Stream */}
        {options.blocks.map((block, idx) => (
          <View key={idx} style={styles.block}>
            {block.type === "heading1" && <Text style={styles.heading1}>{block.content}</Text>}
            {block.type === "heading2" && <Text style={styles.heading2}>{block.content}</Text>}
            {block.type === "heading3" && <Text style={styles.heading3}>{block.content}</Text>}
            {block.type === "paragraph" && <Text style={styles.paragraph}>{block.content}</Text>}
            {block.type === "bullet" && <Text style={styles.bullet}>• {block.content}</Text>}
            {block.type === "checklist" && (
              <Text style={styles.checklist}>
                [{block.checked ? "X" : " "}] {block.content}
              </Text>
            )}
            {block.type === "quote" && <Text style={styles.quote}>{block.content}</Text>}

            {block.type === "code" && (
              <View style={styles.codeCard}>
                <Text style={styles.codeText}>{block.content}</Text>
              </View>
            )}

            {block.type === "cmd" && (
              <View style={styles.cmdCard}>
                <Text style={styles.cmdText}>$ {block.content}</Text>
              </View>
            )}

            {block.type === "vuln" && (
              <View style={styles.vulnCard}>
                <View style={styles.vulnHeader}>
                  <Text style={styles.cveText}>{block.cveId || "Vulnerability Record"}</Text>
                  <Text style={{ fontSize: 9, color: "#ef4444" }}>[{block.severity || "High"}]</Text>
                </View>
                <Text style={styles.paragraph}>{block.content}</Text>
              </View>
            )}

            {block.type === "concept" && (
              <View style={styles.conceptCard}>
                <Text style={styles.conceptTitle}>KEY CONCEPT</Text>
                <Text style={styles.paragraph}>{block.content}</Text>
              </View>
            )}

            {block.type === "divider" && (
              <View style={{ borderBottomWidth: 1, borderBottomColor: "#1f293d", marginVertical: 8 }} />
            )}
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer}>
          CYBER // OS — Security Operating Platform • Generated for Student Study Record
        </Text>
      </Page>
    </Document>
  );
}

export async function generateNotePdfStream(options: RenderNotePdfOptions) {
  return await renderToStream(<NoteDocument options={options} />);
}
