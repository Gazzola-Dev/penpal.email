import { useMediaContext } from "@/providers/MediaProvider";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

// CSS for all animations - now with iteration-count: 1 for all animations
const ANIMATION_STYLES = `
/* Entrance animations */
@keyframes fadeIn-animation {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn-animation {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes zoomIn-animation {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

@keyframes bounceIn-animation {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}

@keyframes flipIn-animation {
  from { transform: perspective(400px) rotateY(90deg); opacity: 0; }
  to { transform: perspective(400px) rotateY(0deg); opacity: 1; }
}

/* Emphasis animations */
@keyframes pulse-animation {
  0% { background-color: rgba(0, 120, 255, 0); }
  50% { background-color: rgba(0, 120, 255, 1); }
  100% { background-color: rgba(0, 120, 255, 0); }
}

@keyframes shake-animation {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes wiggle-animation {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

@keyframes flash-animation {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0; }
}

@keyframes bounce-animation {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

/* Exit animations */
@keyframes fadeOut-animation {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideOut-animation {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

@keyframes zoomOut-animation {
  from { transform: scale(1); }
  to { transform: scale(0); }
}

@keyframes bounceOut-animation {
  0% { transform: scale(1); }
  20% { transform: scale(0.9); }
  50% { transform: scale(1.1); }
  100% { transform: scale(0); }
}

@keyframes flipOut-animation {
  from { transform: perspective(400px) rotateY(0deg); opacity: 1; }
  to { transform: perspective(400px) rotateY(90deg); opacity: 0; }
}

/* Animation classes - limited to one iteration for all types */
.animated-text {
  display: inline-block;
  transform-origin: center;
  backface-visibility: visible;
}

/* Entrance animations - all limited to 1 iteration */
.animated-text-fadeIn { animation: fadeIn-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-slideIn { animation: slideIn-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-zoomIn { animation: zoomIn-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-bounceIn { animation: bounceIn-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-flipIn { animation: flipIn-animation var(--duration) ease-in-out var(--delay) 1 forwards; }

/* Emphasis animations - changed from infinite to 1 */
.animated-text-pulse { animation: pulse-animation var(--duration) ease-in-out var(--delay) 1; }
.animated-text-shake { animation: shake-animation var(--duration) ease-in-out var(--delay) 1; }
.animated-text-wiggle { animation: wiggle-animation var(--duration) ease-in-out var(--delay) 1; }
.animated-text-flash { animation: flash-animation var(--duration) ease-in-out var(--delay) 1; }
.animated-text-bounce { animation: bounce-animation var(--duration) ease-in-out var(--delay) 1; }

/* Exit animations - all limited to 1 iteration */
.animated-text-fadeOut { animation: fadeOut-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-slideOut { animation: slideOut-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-zoomOut { animation: zoomOut-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-bounceOut { animation: bounceOut-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
.animated-text-flipOut { animation: flipOut-animation var(--duration) ease-in-out var(--delay) 1 forwards; }
`;

// Create a style element to inject our animation CSS
const createStyleElement = (): HTMLStyleElement => {
  const style = document.createElement("style");
  style.id = "animated-text-styles";
  style.textContent = ANIMATION_STYLES;
  return style;
};

// Function to add the style to the document if it doesn't exist yet
const ensureStyleElement = (): void => {
  if (!document.getElementById("animated-text-styles")) {
    document.head.appendChild(createStyleElement());
  }
};

const PlaybackAnimationPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const { isPlaying } = useMediaContext();

  useEffect(() => {
    // Make sure our animation styles are in the document
    ensureStyleElement();

    // Function to apply or remove animations to all animated text nodes
    const updateAnimationState = (isAnimating: boolean) => {
      // Find all AnimatedTextNode DOM elements
      const animatedTextElements = document.querySelectorAll(
        "[data-animation-type]"
      );

      // Apply or remove the animation classes
      animatedTextElements.forEach((element) => {
        if (isAnimating) {
          // Add the base animated class
          element.classList.add("animated-text");

          // Get animation data from attributes
          const animationName = element.getAttribute("data-animation-name");
          const delay = element.getAttribute("data-animation-delay") || "0";
          const duration =
            element.getAttribute("data-animation-duration") || "1";

          // Set CSS variables for delay and duration
          (element as HTMLElement).style.setProperty("--delay", `${delay}s`);
          (element as HTMLElement).style.setProperty(
            "--duration",
            `${duration}s`
          );

          // Add the specific animation class
          const animationClass = `animated-text-${animationName}`;
          element.classList.add(animationClass);
        } else {
          // Remove all animation classes
          element.classList.remove("animated-text");

          // Get animation name from attribute
          const animationName = element.getAttribute("data-animation-name");
          if (animationName) {
            element.classList.remove(`animated-text-${animationName}`);
          }

          // Remove CSS variables
          (element as HTMLElement).style.removeProperty("--delay");
          (element as HTMLElement).style.removeProperty("--duration");
        }
      });
    };

    // Apply initial animation state
    updateAnimationState(isPlaying);

    // Set up a mutation observer to watch for new animated text nodes
    const observer = new MutationObserver((mutations) => {
      // Only process if isPlaying is true
      if (isPlaying) {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                // Check if this is an animated text node or contains any
                if (node.hasAttribute("data-animation-type")) {
                  // Add the base animated class
                  node.classList.add("animated-text");

                  // Get animation data from attributes
                  const animationName = node.getAttribute(
                    "data-animation-name"
                  );
                  const delay =
                    node.getAttribute("data-animation-delay") || "0";
                  const duration =
                    node.getAttribute("data-animation-duration") || "1";

                  // Set CSS variables for delay and duration
                  node.style.setProperty("--delay", `${delay}s`);
                  node.style.setProperty("--duration", `${duration}s`);

                  // Add the specific animation class
                  const animationClass = `animated-text-${animationName}`;
                  node.classList.add(animationClass);
                }

                // Check child elements
                const animatedChildren = node.querySelectorAll(
                  "[data-animation-type]"
                );
                animatedChildren.forEach((child) => {
                  if (child instanceof HTMLElement) {
                    // Add the base animated class
                    child.classList.add("animated-text");

                    // Get animation data from attributes
                    const animationName = child.getAttribute(
                      "data-animation-name"
                    );
                    const delay =
                      child.getAttribute("data-animation-delay") || "0";
                    const duration =
                      child.getAttribute("data-animation-duration") || "1";

                    // Set CSS variables for delay and duration
                    child.style.setProperty("--delay", `${delay}s`);
                    child.style.setProperty("--duration", `${duration}s`);

                    // Add the specific animation class
                    const animationClass = `animated-text-${animationName}`;
                    child.classList.add(animationClass);
                  }
                });
              }
            });
          }
        });
      }
    });

    // Start observing the editor container
    const editorContainer = document.querySelector(".editor-container");
    if (editorContainer) {
      observer.observe(editorContainer, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }

    // Clean up function
    return () => {
      observer.disconnect();
      // Remove all animations when component unmounts
      const animatedTextElements = document.querySelectorAll(".animated-text");
      animatedTextElements.forEach((element) => {
        // Remove the base animated class
        element.classList.remove("animated-text");

        // Get animation name from attribute
        const animationName = element.getAttribute("data-animation-name");
        if (animationName) {
          element.classList.remove(`animated-text-${animationName}`);
        }

        // Remove CSS variables
        if (element instanceof HTMLElement) {
          element.style.removeProperty("--delay");
          element.style.removeProperty("--duration");
        }
      });
    };
  }, []);

  // Effect to handle changes to isPlaying state
  useEffect(() => {
    // Update animation state when isPlaying changes
    const updateAnimations = () => {
      editor.getEditorState().read(() => {
        // Find all AnimatedTextNode DOM elements
        const animatedTextElements = document.querySelectorAll(
          "[data-animation-type]"
        );

        // Apply or remove the animation classes
        animatedTextElements.forEach((element) => {
          if (isPlaying) {
            // Add the base animated class
            element.classList.add("animated-text");

            // Get animation data from attributes
            const animationName = element.getAttribute("data-animation-name");
            const delay = element.getAttribute("data-animation-delay") || "0";
            const duration =
              element.getAttribute("data-animation-duration") || "1";

            // Set CSS variables for delay and duration
            (element as HTMLElement).style.setProperty("--delay", `${delay}s`);
            (element as HTMLElement).style.setProperty(
              "--duration",
              `${duration}s`
            );

            // Add the specific animation class
            const animationClass = `animated-text-${animationName}`;
            element.classList.add(animationClass);
          } else {
            // Remove all animation classes
            element.classList.remove("animated-text");

            // Get animation name from attribute
            const animationName = element.getAttribute("data-animation-name");
            if (animationName) {
              element.classList.remove(`animated-text-${animationName}`);
            }

            // Remove CSS variables
            (element as HTMLElement).style.removeProperty("--delay");
            (element as HTMLElement).style.removeProperty("--duration");
          }
        });
      });
    };

    // Apply animations whenever isPlaying changes
    updateAnimations();
  }, [isPlaying, editor]);

  return null;
};

export default PlaybackAnimationPlugin;
