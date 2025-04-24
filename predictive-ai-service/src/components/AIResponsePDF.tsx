import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subheader: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 3,
  },
});

export const AIResponsePDF = ({
  riskScore,
  riskScoreExplanation,
  recommendedTreatments,
  conditionTrends,
  preventiveMeasures,
  normalResponse,
  accuracy,
  accuracyExplanation,
}: {
  riskScore: number;
  riskScoreExplanation: string;
  recommendedTreatments: string[];
  conditionTrends: string[];
  preventiveMeasures: string[];
  normalResponse: string;
  accuracy: number;
  accuracyExplanation: string;
}) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>AI Response Summary</Text>

      {/* Risk Score */}
      <Text style={styles.subheader}>Risk Score: {riskScore}%</Text>
      <Text style={styles.text}>{riskScoreExplanation}</Text>

      {/* Overall AI Accuracy */}
      <Text style={styles.subheader}>
        Overall AI Accuracy: {(accuracy * 100).toFixed(2)}%
      </Text>
      <Text style={styles.text}>{accuracyExplanation}</Text>

      {/* Normal Response */}
      <Text style={styles.subheader}>Quick Summary:</Text>
      <Text style={styles.text}>{normalResponse}</Text>

      {/* Recommended Treatments */}
      {recommendedTreatments && recommendedTreatments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Recommended Treatments:</Text>
          <View style={styles.list}>
            {recommendedTreatments.map((treatment, index) => (
              <Text style={styles.listItem} key={index}>
                {treatment}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Condition Trends */}
      {conditionTrends && conditionTrends.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Condition Trends:</Text>
          <View style={styles.list}>
            {conditionTrends.map((trend, index) => (
              <Text style={styles.listItem} key={index}>
                {trend}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Preventive Measures */}
      {preventiveMeasures && preventiveMeasures.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Preventive Measures:</Text>
          <View style={styles.list}>
            {preventiveMeasures.map((measure, index) => (
              <Text style={styles.listItem} key={index}>
                {measure}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Friendly Message */}
      <Text style={styles.text}>
        Predictions should be interpreted as supplementary insights, not
        absolute medical conclusions.
      </Text>
    </Page>
  </Document>
);
