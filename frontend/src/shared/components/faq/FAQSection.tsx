import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  faqs: FAQItem[];
}

export function FAQSection({ title, faqs }: FAQSectionProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="heading-lg text-center">
        {title.split(/(\*[^*]+\*)/).map((part, i) => {
          if (part.startsWith("*") && part.endsWith("*")) {
            return (
              <span key={i} className="gradient-text">
                {part.slice(1, -1)}
              </span>
            );
          }
          return part;
        })}
      </h2>
      <Accordion multiple className="mt-8 space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="rounded-2xl border border-zinc-200 bg-white px-5 py-0 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <AccordionTrigger className="py-4 text-left text-base font-semibold text-zinc-900 hover:no-underline hover:text-sky-600 [&[data-state=open]]:text-sky-600 dark:text-white">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="body-md text-zinc-600 dark:text-zinc-400">
                {faq.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
