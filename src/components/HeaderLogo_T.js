import React from "react";
import { Image } from "react-native";
const LogoTitle = () => (
    <Image
      style={{ width: 120, height: 50 }}
      resizeMode="contain"
      source={require('./../assets/logoWhite.png')}
    />
  );

export default LogoTitle;