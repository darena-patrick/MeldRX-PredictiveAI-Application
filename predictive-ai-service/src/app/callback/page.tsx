"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser, setToken, setPatientId } from "../redux/authSlice"; // Adjust path to redux slice
import { handleCallback } from "@/utils/auth"; // Assuming this function handles the callback logic

export default function Callback() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const authenticateCallback = async () => {
      try {
        // Call the handleCallback function to process authentication
        const userData = await handleCallback();

        if (userData && userData.user && userData.token) {
          // Ensure userData is correctly set before dispatching
          console.log("Dispatching authenticated user and token:", userData);

          // Dispatch user and token to redux store
          dispatch(setUser(userData.user)); // Pass serialized user data
          dispatch(setToken(userData.token));
          dispatch(setPatientId(userData.patientId || null));

          // Optionally, log user info
          console.log("User authenticated:", userData.user);

          // Redirect to home or other page after successful authentication
          router.push("/"); // Redirect to the home page or any other page you want
        }
      } catch (error) {
        console.error("Authentication error:", error); // Handle any authentication error
      }
    };

    authenticateCallback(); // Trigger the callback processing
  }, [dispatch, router]);

  return <p>Processing your login...</p>; // Optional: Display a message while login is being processed
}
