import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination, pageWindow } from "./Pagination";

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it("collapses the middle with ellipses", () => {
    expect(pageWindow(10, 20)).toEqual([1, "…", 9, 10, 11, "…", 20]);
  });
  it("keeps the start/end contiguous near the edges", () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, 4, "…", 20]);
    expect(pageWindow(20, 20)).toEqual([1, "…", 17, 18, 19, 20]);
  });
});

describe("<Pagination />", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("marks the current page and calls onChange", async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(onChange).toHaveBeenCalledWith(4);
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("disables prev on the first page and next on the last", () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    rerender(<Pagination page={3} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
