// this component loads the font awesome icon library for web platforms
// it adds both the javascript and css needed for icons to work

import React, { useEffect } from "react";
import { Platform } from "react-native";

export default function FontAwesomeScript() {
  useEffect(() => {
    // only load font awesome if we're on web
    if (Platform.OS === "web") {
      // add the main font awesome javascript file
      const script = document.createElement("script");
      script.src = "https://kit.fontawesome.com/a076d05399.js";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      // add the font awesome css styles
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
      document.head.appendChild(link);
    }
  }, []);

  // this component is invisible and only loads scripts
  return null;
}
