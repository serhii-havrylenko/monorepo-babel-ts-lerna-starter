import * as React from "react";
import styled from "styled-components";

const BoldText = styled.span`
  font-weight: bold;
`;
const wrapText = (text: string) => <BoldText>${text}</BoldText>;

export const LoginForm: React.SFC = () => <div>${wrapText("Login form")}</div>;
