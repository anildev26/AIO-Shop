interface Props {
  whatsappNumber?: string;
  telegramUsername?: string;
}

export default function ContactTab({ whatsappNumber, telegramUsername }: Props) {
  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I came from AIO Shop and I'm interested in your products.")}`
    : null;

  const tgLink = telegramUsername
    ? (telegramUsername.startsWith("http") ? telegramUsername : `https://t.me/${telegramUsername.replace("@", "")}`)
    : null;

  return (
    <div className="max-w-lg sm:max-w-none py-2">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 sm:text-left text-center">Get in Touch</h2>
      <p className="text-slate-500 dark:text-slate-400 sm:text-left text-center mb-4">
        Have questions? Reach out to us anytime.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600 dark:text-green-400">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor"/>
                <path d="M12 2C6.486 2 2 6.486 2 12c0 1.89.525 3.66 1.438 5.168L2.02 22.01l4.98-1.398A9.95 9.95 0 0 0 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18a7.95 7.95 0 0 1-4.27-1.24l-.307-.184-2.96.832.832-2.96-.184-.307A7.95 7.95 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">WhatsApp</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{whatsappNumber}</p>
            </div>
            <svg className="ml-auto w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </a>
        )}

        {tgLink && (
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-500 dark:text-blue-400">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">Telegram</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {telegramUsername?.startsWith("http") ? "Profile Link" : `@${telegramUsername?.replace("@", "")}`}
              </p>
            </div>
            <svg className="ml-auto w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </a>
        )}
      </div>
    </div>
  );
}
