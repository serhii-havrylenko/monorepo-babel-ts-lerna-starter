import * as React from "react";
const wrapText = (text) => React.createElement("span", null,
    "$",
    text);
export const LoginForm = () => React.createElement("div", null,
    "$",
    wrapText("Login form"));
