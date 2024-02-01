import "@testing-library/jest-dom";
import React from "react";

import Home from "../../../src/pages";
import { render, screen } from "@testing-library/react";

describe("Home Page", () => {
  it("Should contain Welcome", () => {
    render(<Home />);

    const heading = screen.getByTestId("welcome");

    expect(heading).toHaveTextContent("Welcome!!");
  });
});
