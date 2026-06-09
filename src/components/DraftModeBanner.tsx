export function DraftModeBanner() {
  return (
    <div className="bg-pink text-white text-center text-sm py-1.5 px-4">
      <span className="meta !text-white">Draft preview</span>{" "}
      <a
        href="/api/draft-mode/disable"
        className="underline underline-offset-2 ml-2"
      >
        Exit preview
      </a>
    </div>
  );
}
