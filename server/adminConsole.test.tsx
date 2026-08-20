/* @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminConsole } from "../components/admin/AdminConsole";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  remove: vi.fn(),
  delete: vi.fn(),
}));

const profile = {
  id: "profile-1",
  name: "Mohammed Bajhaw",
  professional_title: "Mechatronics Engineer",
  location: "Elazığ",
  email: "mohammedbajhaw2020@gmail.com",
  linkedin_url: null,
  phone: null,
  bio: "Portfolio profile",
};

vi.mock("@/lib/supabase/browser", () => ({
  getBrowserSupabase: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "admin-1" } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
    from: vi.fn(() => ({
      select: mocks.select,
      update: mocks.update,
      insert: mocks.insert,
      delete: mocks.delete,
    })),
    storage: { from: vi.fn(() => ({ upload: vi.fn(), remove: mocks.remove })) },
  }),
}));

describe("Next.js admin console", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.select.mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [profile], error: null }) });
    mocks.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mocks.insert.mockResolvedValue({ error: null });
    mocks.delete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  });

  it("loads a manager session, saves a record, creates a test record, and confirms a delete", async () => {
    render(<AdminConsole />);

    const profileLabel = await screen.findByText("Mohammed Bajhaw", { selector: "strong" });
    fireEvent.click(profileLabel.closest("button")!);
    const editor = screen.getByRole("textbox");
    expect((editor as HTMLTextAreaElement).value).toContain("Mechatronics Engineer");

    fireEvent.change(editor, { target: { value: JSON.stringify({ ...profile, professional_title: "Robotics Engineer" }) } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "New record" }));
    fireEvent.change(editor, { target: { value: JSON.stringify({ label: "admin-console-test", category: "Validation", icon: "Test", sort_order: 999999 }) } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await waitFor(() => expect(mocks.insert).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText("Mohammed Bajhaw", { selector: "strong" }).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await screen.findByText("Delete this record?");
    fireEvent.click(screen.getByRole("button", { name: "Delete record" }));
    await waitFor(() => expect(mocks.delete).toHaveBeenCalledTimes(1));
  });
});
