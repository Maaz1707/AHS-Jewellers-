import Image, { type ImageProps } from "next/image";
import { OPTIMISED_HOST, upstreamSrc } from "@/lib/images";

/**
 * next/image with one rule added: stock photographs and local files go through
 * this site’s optimiser (WebP/AVIF, same origin); image links from any other
 * host, such as ones pasted in the owner’s panel, are shown as they are.
 */
export default function Img({ alt, ...props }: ImageProps) {
  if (typeof props.src !== "string" || !props.src.startsWith("http")) return <Image alt={alt} {...props} />;
  const optimised = OPTIMISED_HOST.test(props.src);
  return <Image alt={alt} {...props} src={optimised ? upstreamSrc(props.src) : props.src} unoptimized={props.unoptimized ?? !optimised} />;
}
