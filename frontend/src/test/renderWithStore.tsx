import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/redux/store";

/** Renders with a fresh Redux store and returns it so tests can inspect/dispatch. */
export function renderWithStore(ui: React.ReactElement) {
  const store = makeStore();
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}
