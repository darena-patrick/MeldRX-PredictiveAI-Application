import {
  Document as PDFDoc,
  Page,
  Text,
  StyleSheet,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  text: { fontSize: 12, marginBottom: 5 },
  header: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
});

const AnalysisPDF = ({ content }: { content: string }) => (
  <PDFDoc>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>AI Analysis</Text>
        <Text style={styles.text}>{content}</Text>
      </View>
    </Page>
  </PDFDoc>
);

export default AnalysisPDF;
