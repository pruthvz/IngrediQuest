// handles external links in the app, opening them in the browser
// on web: opens in new tab
// on mobile: opens in in-app browser
import { Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { type ComponentProps } from "react";
import { Platform } from "react-native";

// props are same as Link component but href is required
type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        // handle native platforms differently
        if (Platform.OS !== "web") {
          // prevent default link behavior on mobile
          event.preventDefault();
          // use expo's in-app browser instead
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
