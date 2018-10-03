import "@blueprintjs/core/lib/css/blueprint.css";
import ExceptionalHeadsUp from "@r2c/extension/content/headsup/ExceptionalHeadsup";
import {
  ErrorHeadsUp,
  LoadingHeadsUp,
  UnsupportedHeadsUp
} from "@r2c/extension/content/headsup/NonIdealHeadsup";
import centered from "@storybook/addon-centered";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import "./index.css";

storiesOf("Headsup", module)
  .addDecorator(centered)
  .add("Non-ideal, loading", () => <LoadingHeadsUp />)
  .add("Non-ideal, error, Error()", () => (
    <ErrorHeadsUp error={new Error("Example error")} />
  ))
  .add("Non-ideal, unsupported", () => <UnsupportedHeadsUp />)
  .add("Exceptional", () => <ExceptionalHeadsUp />);
