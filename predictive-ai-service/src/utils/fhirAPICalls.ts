import axios from "axios";
import { setDocuments } from "@/app/redux/documentSlice";
import { setConditions } from "@/app/redux/conditionSlice";
import { setObservations } from "@/app/redux/observationsSlice";

export const fetchDocuments = async (
    token: string,
    patientId: string,
    dispatch: any,
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void
  ) => {
    if (!token || !patientId) return;

    setLoading(true);
  
    try {
      let allDocuments: any[] = [];
      let nextUrl = `https://app.meldrx.com/api/fhir/${process.env.NEXT_PUBLIC_APP_ID}/DocumentReference?patient=${patientId}`;
  
      while (nextUrl && allDocuments.length < 10) {
        const bundleResponse = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const documentResponses = await Promise.all(
          bundleResponse.data.entry.map((entry: any) =>
            axios.get(entry.fullUrl, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
  
        allDocuments = [
          ...allDocuments,
          ...documentResponses.map((res) => res.data),
        ];
  
        if (allDocuments.length >= 10) break;
  
        nextUrl =
          bundleResponse.data.link?.find((link: any) => link.relation === "next")?.url || null;
      }
  
      dispatch(setDocuments(allDocuments));
      console.log("docs are", allDocuments);
      console.log("docs are stringify", JSON.stringify(allDocuments));
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };


  export const fetchConditions = async (
    token: string,
    patientId: string,
    dispatch: any,
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void,
    fetchConditionAIInsights: (conditions: any[]) => void
  ) => {
    if (!token || !patientId) return;
  
    setLoading(true);
  
    try {
      let allConditions: any[] = [];
      let nextUrl = `https://app.meldrx.com/api/fhir/${process.env.NEXT_PUBLIC_APP_ID}/Condition?patient=${patientId}`;
  
      while (nextUrl && allConditions.length < 6) {
        const bundleResponse = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const conditionResponses = await Promise.all(
          bundleResponse.data.entry.map((entry: any) =>
            axios.get(entry.fullUrl, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
  
        allConditions = [
          ...allConditions,
          ...conditionResponses.map((res) => res.data),
        ];
  
        if (allConditions.length >= 6) break;
  
        nextUrl =
          bundleResponse.data.link?.find((link: any) => link.relation === "next")
            ?.url || null;
      }
  
      dispatch(setConditions(allConditions));
      fetchConditionAIInsights(allConditions.slice(0, 6));
    } catch (error) {
      console.error("Error fetching conditions:", error);
      setError("Failed to fetch conditions.");
    } finally {
      setLoading(false);
    }
  };

  export const fetchObservations = async (
    token: string,
    patientId: string,
    dispatch: any,
    fetchObservationAIInsights: (observations: any[]) => void
  ) => {
    if (!token || !patientId) return;
  
    try {
      let allObservations: any[] = [];
      let nextUrl = `https://app.meldrx.com/api/fhir/${process.env.NEXT_PUBLIC_APP_ID}/Observation?patient=${patientId}`;
  
      while (nextUrl && allObservations.length < 6) {
        const response = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const observationResponses = await Promise.all(
          response.data.entry.map((entry: any) =>
            axios.get(entry.fullUrl, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
  
        allObservations = [
          ...allObservations,
          ...observationResponses.map((res) => res.data),
        ];
  
        if (allObservations.length >= 6) break;
  
        nextUrl = response.data.link?.find(
          (link: any) => link.relation === "next"
        )?.url || null;
      }
  
      dispatch(setObservations(allObservations.slice(0, 6)));
      fetchObservationAIInsights(allObservations.slice(0, 6));
    } catch (error) {
      console.error("Error fetching observations:", error);
    }
  };