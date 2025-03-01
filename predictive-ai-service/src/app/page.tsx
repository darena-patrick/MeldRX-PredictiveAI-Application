"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setUser, setToken, setPatientId } from "./redux/authSlice"; // Adjust path to redux slice
import { handleCallback, handleLaunch } from "../utils/auth"; // Assuming these functions are implemented
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);
  const patientId = useSelector((state: any) => state.auth.patientId);
  const [loading, setLoading] = useState(true); // State to handle loading state

  useEffect(() => {
    console.log("Redux User:", user);
    console.log("Redux Token:", token);
    console.log("Redux Patient ID:", patientId);
  }, [user, token, patientId]);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        if (window.location.pathname === "/callback") {
          console.log("Handling authentication callback...");
          const userData = await handleCallback();
          if (userData && userData.user && userData.token) {
            dispatch(setUser(userData.user));
            dispatch(setToken(userData.token));
            dispatch(setPatientId(userData.patientId || null)); // Store patientId
            console.log("User authenticated:", userData.user);
          }
        } else if (window.location.pathname === "/launch") {
          console.log("Handling SMART launch...");
          const userData = await handleLaunch();
          if (userData && userData.user && userData.token) {
            dispatch(setUser(userData.user));
            dispatch(setToken(userData.token));
            dispatch(setPatientId(userData.patientId || null)); // Store patientId
            console.log("Launch successful:", userData.user);
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setLoading(false);
      }
    };

    authenticateUser();
  }, [dispatch]);

  return (
    <main>
      <h1>Welcome to the Predictive AI Healthcare App</h1>
      {loading ? (
        <p>Authenticating...</p>
      ) : user && token ? (
        <>
          <p>Authenticated as {user.name}</p>
          {patientId && <p>Patient ID: {patientId}</p>}{" "}
          {/* Display Patient ID */}
          <Dashboard />
        </>
      ) : (
        <p>Not authenticated</p>
      )}
    </main>
  );
}
