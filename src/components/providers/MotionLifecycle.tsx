"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Keep decorative CSS drift asleep outside the viewport, including hidden tabs. */
export default function MotionLifecycle() {
  const pathname = usePathname();
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("main section")];
    const visible = new Set<Element>();
    const update = () => sections.forEach((section) => {
      section.dataset.motionRunning = String(!document.hidden && visible.has(section));
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      update();
    });
    sections.forEach((section) => {
      section.dataset.motionRunning = "false";
      observer.observe(section);
    });
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      sections.forEach((section) => delete section.dataset.motionRunning);
    };
  }, [pathname]);
  return null;
}
