"use client";
import { Icon } from "@/components/ui/brand-icon";
import { Badge, Button, Modal } from "@/components/ui/cepp";
import { useData } from "@/hooks/use-api-data";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { toast } from "sonner";
export function Navbar({ home = false }: { home?: boolean }) {
  const { model, update } = useCepp(),
    router = useRouter(),
    path = usePathname();
  const [menu, setMenu] = useState(false),
    [bell, setBell] = useState(false),
    [login, setLogin] = useState(false),
    [mobile, setMobile] = useState(false);
  const notifications = useData(api.notifications, mockNotifications);
  const unread = model.unread < 0 ? mockNotifications.length - 1 : model.unread;
  const ref = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef<number | null>(null);
  useEffect(() => {
    const cancelScroll = () => {
      if (scrollFrame.current !== null)
        cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
    };
    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchstart", cancelScroll, { passive: true });
    return () => {
      cancelScroll();
      window.removeEventListener("wheel", cancelScroll);
      window.removeEventListener("touchstart", cancelScroll);
    };
  }, []);
  const scrollToSection = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    setMobile(false);
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    const from = window.scrollY;
    const to = Math.max(
      0,
      Math.min(
        from + section.getBoundingClientRect().top - 105,
        document.documentElement.scrollHeight - window.innerHeight,
      ),
    );
    window.history.replaceState(window.history.state, "", "#" + id);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, to);
      return;
    }
    const started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / 550);
      const eased =
        progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo(0, from + (to - from) * eased);
      if (progress < 1) scrollFrame.current = requestAnimationFrame(animate);
      else scrollFrame.current = null;
    };
    scrollFrame.current = requestAnimationFrame(animate);
  };
  useEffect(() => {
    setMenu(false);
    setBell(false);
    setMobile(false);
  }, [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setMenu(false);
        setBell(false);
      }
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setBell(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const start = () => {
    if (model.signedIn) router.push("/upload");
    else setLogin(true);
  };
  return (
    <>
      <header className="cepp-nav">
        <nav>
          <Link className="cepp-brand" href="/">
            <span className="cepp-logo">
              <Icon name="shield" />
              <i />
            </span>
            <span>
              Zero <b>Trust</b> Face Detection
            </span>
          </Link>
          {home && (
            <div className={"cepp-nav-links " + (mobile ? "open" : "")}>
              <a
                href="#features"
                onClick={(event) => scrollToSection(event, "features")}
              >
                Features
              </a>
              <a
                href="#technology"
                onClick={(event) => scrollToSection(event, "technology")}
              >
                Technology
              </a>
              <a
                href="#process"
                onClick={(event) => scrollToSection(event, "process")}
              >
                Process
              </a>
            </div>
          )}
          <div className="cepp-nav-actions" ref={ref}>
            {!model.signedIn ? (
              <>
                <Button secondary small onClick={start}>
                  Sign in
                </Button>
              </>
            ) : (
              <>
                <button
                  className="cepp-icon-button"
                  aria-label="Notifications"
                  aria-expanded={bell}
                  onClick={() => {
                    setBell(!bell);
                    setMenu(false);
                  }}
                >
                  <Icon name="bell" />
                  {unread > 0 && <i className="cepp-unread" />}
                </button>
                <button
                  className="cepp-profile-toggle"
                  aria-label="Profile menu"
                  aria-expanded={menu}
                  onClick={() => {
                    setMenu(!menu);
                    setBell(false);
                  }}
                >
                  <span className="cepp-avatar">
                    <Icon name="user" size={16} />
                  </span>
                  <Icon name="chevron" size={14} />
                </button>
              </>
            )}
            {home && (
              <button
                className="cepp-mobile-toggle"
                aria-label="Toggle navigation"
                aria-expanded={mobile}
                onClick={() => setMobile(!mobile)}
              >
                ☰
              </button>
            )}
            {menu && (
              <div className="cepp-dropdown">
                <div className="cepp-dropdown-user">
                  <span className="cepp-avatar">
                    {(model.name || "Test User")
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <strong>{model.name || "Test User"}</strong>
                    <p>@user1</p>
                  </div>
                </div>
                {[
                  ["Profile", "/profile"],
                  ["My Credit Card", "/credit-cards"],
                  ["Billing", "/billing"],
                  ["History", "/history"],
                  ["My File", "/my-file"],
                  ["Workspace", "/workspace"],
                  ["My Group", "/my-group"],
                  ["Key Management", "/key-management"],
                ].map(([label, url]) => (
                  <Link key={url} href={url}>
                    {label}
                  </Link>
                ))}
                <button
                  className="danger"
                  onClick={async () => {
                    try {
                      if (backendEnabled) await api.signOut();
                      update((m) => ({ ...m, signedIn: false }));
                      setMenu(false);
                      router.push("/");
                    } catch {
                      toast.error("Unable to sign out. Try again.");
                    }
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
            {bell && (
              <div className="cepp-notifications cepp-dropdown">
                <div className="cepp-row">
                  <h2>Notifications</h2>
                  <button
                    onClick={async () => {
                      try {
                        if (backendEnabled) await api.markRead();
                        update((m) => ({ ...m, unread: 0 }));
                      } catch {
                        toast.error("Unable to mark notifications read");
                      }
                    }}
                  >
                    Mark all read
                  </button>
                </div>
                <p>การแจ้งเตือน</p>
                {(notifications.data || []).map((n) => (
                  <Link key={n.title} href={n.href}>
                    <div className="cepp-row">
                      <strong>{n.title}</strong>
                      {!n.read && unread > 0 && <Badge>●</Badge>}
                    </div>
                    <p>{n.description}</p>
                    <small>{n.time}</small>
                  </Link>
                ))}
                <Link href="/notifications">View all notifications</Link>
              </div>
            )}
          </div>
        </nav>
      </header>
      <Modal
        open={login}
        onClose={() => setLogin(false)}
        title="Sign in"
        description="Use your Google account to continue."
      >
        <Button
          secondary
          onClick={() => {
            if (backendEnabled) {
              window.location.assign(api.signInUrl());
              return;
            }
            update((m) => ({ ...m, signedIn: true }));
            setLogin(false);
            router.replace("/");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        >
          <Icon name="google" size={19} />
          Continue with Google
        </Button>

        <div className="cepp-row">
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </Modal>
    </>
  );
}
const mockNotifications = [
  {
    title: "Batch 1 completed",
    description: "24 images ready · Enterprise A / Group 1",
    time: "2 minutes ago · Unread",
    href: "/completed",
  },
  {
    title: "Drone Footage processing",
    description: "12 files · encrypted processing continues",
    time: "8 minutes ago · Unread",
    href: "/progress",
  },
  {
    title: "Group invitation · Enterprise A",
    description: "Pim Suri invited you to Group 4.",
    time: "25 minutes ago · Unread",
    href: "/my-group?invited=1",
  },
  {
    title: "Group 3 role updated",
    description: "You are now a Group Admin.",
    time: "Yesterday · Read",
    href: "/my-group/3",
  },
].map((item, index) => ({ ...item, id: String(index), read: index > 2 }));
