import { NextApiRequest, NextApiResponse } from "next";
import { patientAnalysisDates } from "./cds-services/[id]";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { patientId, date } = req.query;
  if (typeof patientId !== "string" || typeof date !== "string") {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  patientAnalysisDates[patientId] = date;

  return res.status(200).json({ message: "Patient analysis date updated" });
}
