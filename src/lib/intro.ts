/**
 * The opening sequence plays once per browser session, only when the session
 * starts on the home page, and never with reduced motion. The decision is made
 * by an inline script before first paint (see INTRO_SCRIPT), which sets
 * `html[data-intro]` so the curtain is in place without a flash.
 */
export const INTRO_KEY = "ahs-intro-seen";

/** How long immediate reveals on the home page wait while the curtain plays. */
export const INTRO_DELAY = 1.5;

export const INTRO_SCRIPT = `try{var d=document.documentElement;if(!sessionStorage.getItem("${INTRO_KEY}")){sessionStorage.setItem("${INTRO_KEY}","1");if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-intro","")}}}catch(e){}`;

/** True while the curtain is up (client only). */
export const introPlaying = () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-intro");
