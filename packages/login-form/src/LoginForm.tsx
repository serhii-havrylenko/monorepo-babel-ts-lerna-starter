import * as React from "react";

const wrapText = (text: string) => <span>${text}</span>;

export const LoginForm: React.SFC = () => <div>${wrapText("Login form")}</div>;
