"use client"

export default function ShareButton({ name, avgRating }: { name: string; avgRating: string | null }) {
  async function handleShare() {
    const url = window.location.href
    const text = avgRating
      ? `Check out ${name}'s faculty rating on Rate My Faculty — ${avgRating}/5 ⭐`
      : `Rate ${name} on Rate My Faculty — SRMIST's anonymous faculty review platform`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — Rate My Faculty`, text, url })
      } catch (e) {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex-1 border border-gray-700 text-gray-300 text-center font-bold py-3 rounded-xl hover:border-gray-500 hover:text-white transition flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share
    </button>
  )
}