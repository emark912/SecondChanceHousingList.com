import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  city: string;
  state: string;
  story: string;
  rating: number;
  hosingType: string;
  image: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Maria Rodriguez",
    city: "Atlanta",
    state: "GA",
    story:
      "I had a bankruptcy on my record and thought finding an apartment would be impossible. SecondChanceHousingList.com found me 3 amazing options within my budget. I was approved for my dream apartment in just 2 weeks! The support team was incredible throughout the process.",
    rating: 5,
    hosingType: "Apartment",
    image: "https://private-us-east-1.manuscdn.com/sessionFile/sdHT03nvrYhKXPcXiG7ZuR/sandbox/M11Gn9ub4Msl6F8mKJnAyp-img-1_1771085089000_na1fn_dGVzdGltb25pYWwtMS1tYXJpYQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc2RIVDAzbnZyWWhLWFBjWGlHN1p1Ui9zYW5kYm94L00xMUduOXViNE1zbDZGOG1LSm5BeXAtaW1nLTFfMTc3MTA4NTA4OTAwMF9uYTFmbl9kR1Z6ZEdsdGIyNXBZV3d0TVMxdFlYSnBZUS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Rxivk0SqxCJAe6~BSvMb9bbBt578N8LthiQNqEXqPj1cMdXQvi9ucuKlJExT3~AKnGBxDgV9dmPfxG1uv2GkEhK1Z17Vuu1CSMcDOBABxIi8g3fUz7mWyh4iY8QMJYyeGm9iZkaVG8NM1QOj2T08HVNwNd8WqKYtZh6NtyCqLVU2rVJHEqw-2c2cm71JwkPl4atP18rWQzph5TfBZ7-DCdhCwHnvv~CpRA9ab3qy0Y4IvMCeBhzhEJOi25KDlAp8Guh-hJyEDQKf-66Uf984ArDeuoyYqKwC885TxBLkUXFqWMeAwI4tyfmNr5yYQJuJO0QfWGPNmhFrqTb3lcjy8g__",
  },
  {
    id: 2,
    name: "James Thompson",
    city: "Atlanta",
    state: "GA",
    story:
      "After my eviction, I was scared about my future. This service gave me hope and real options. The AI matching was spot-on - every property on my list was perfect for my situation. I got approved and moved into my new home within 3 weeks!",
    rating: 5,
    hosingType: "Apartment",
    image: "https://private-us-east-1.manuscdn.com/sessionFile/sdHT03nvrYhKXPcXiG7ZuR/sandbox/M11Gn9ub4Msl6F8mKJnAyp-img-2_1771085092000_na1fn_dGVzdGltb25pYWwtMi1qYW1lcw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc2RIVDAzbnZyWWhLWFBjWFBjWGlHN1p1Ui9zYW5kYm94L00xMUduOXViNE1zbDZGOG1LSm5BeXAtaW1nLTJfMTc3MTA4NTA5MjAwMF9uYTFmbl9kR1Z6ZEdsdGIyNXBZV3d0TWkxcVlXMWxjdy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=n9GxDli-e3cf~OoGFWG61s47se8rHkbjNNQ3PfJrYhADkFv1lSHykBXv1y3bz2W2jDeU4UxbzsLEp4dCweHOOBppAF-CPtCjZV~cRgJmvKVc-ftckv95D7nWdNCLGYFgSW-zhL1J5oFxt~HkoReE72ITIsVzwkqc7tSb83~LUZocfir-cNniAoTB2LA4C0N1YfaEiwLpijBm1V9u44DCitZoBPXcNaOlU18dMgeRIw22TAfztN91uFbgnoLtz~89sC94yIPTAROX41a1weSkewCi2lJlsceejvVMtedqXzkAk9kZEosMmnlrliEwfxzLzZ4FLCVU7Nr~Fq2tLWMCZw__",
  },
  {
    id: 3,
    name: "Sarah Mitchell",
    city: "Atlanta",
    state: "GA",
    story:
      "As a young professional with a low credit score, I thought I'd be stuck in a bad situation forever. SecondChanceHousingList found me 5 great apartments I actually qualified for. The coupon code saved me $200 in application fees! Highly recommend!",
    rating: 5,
    hosingType: "Apartment",
    image: "https://private-us-east-1.manuscdn.com/sessionFile/sdHT03nvrYhKXPcXiG7ZuR/sandbox/M11Gn9ub4Msl6F8mKJnAyp-img-3_1771085087000_na1fn_dGVzdGltb25pYWwtMy1zYXJhaA.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc2RIVDAzbnZyWWhLWFBjWGlHN1p1Ui9zYW5kYm94L00xMUduOXViNE1zbDZGOG1LSm5BeXAtaW1nLTNfMTc3MTA4NTA4NzAwMF9uYTFmbl9kR1Z6ZEdsdGIyNXBZV3d0TXkxellYSmhhQS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=MozR~qCR6Tv~nqG-Di2Y9jUWVjoKfIWP9VzTBjSnX3VtfIGos6LkcyMtx-dU0Jhi6jRoUVTEs5G9Fpf~3HXkBPBrfcUYIdUKa0fDe~9PjUA1QQEc6UxlTQDv6lnokRvY8knYQzC-LU6r7j5NqhzLeTidyHPC1Y21Ae9txMjmO2Q9wHfBhhktM17O8KKOjU67fE3iQCYFA4yf-HE7-OlNbVM2TPmh2O8HteRdVHTWcbCaCx6RdlJ4D7Ic-1lrma~QPSoZ-kz7byS6c-kfn8GAgJxyB7eu-YZ3m6cRWdvrHImyvpIF~5cewnvgxlL3oCzIJ1JMiunlEQrtHKElWVbJRw__",
  },
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex + newDirection + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-blue-950/20 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Success Stories from Our Community
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Real renters with real challenges who found stable housing through our AI-powered search engine
            </p>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm min-h-96 flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.5 },
                }}
                className="w-full"
              >
                <div className="text-center">
                  {/* Star Rating */}
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed italic max-w-3xl mx-auto"
                  >
                    "{currentTestimonial.story}"
                  </motion.p>

                  {/* Customer Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-4"
                  >
                    {currentTestimonial.image && (
                      <motion.img
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {currentTestimonial.name}
                      </h3>
                      <p className="text-gray-400">
                        {currentTestimonial.city}, {currentTestimonial.state}
                      </p>
                      <p className="text-sm text-cyan-300 font-semibold">
                        Found: {currentTestimonial.hosingType}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 px-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(-1)}
              className="p-3 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-cyan-400 w-8"
                      : "bg-gray-600 w-2 hover:bg-gray-500"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(1)}
              className="p-3 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Counter */}
          <div className="text-center mt-6 text-gray-400 text-sm">
            {currentIndex + 1} of {TESTIMONIALS.length}
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            { icon: "✓", label: "95% Approval Rate", value: "Verified" },
            { icon: "⏱", label: "Average 2 Weeks", value: "To Housing" },
            { icon: "🏠", label: "500+ Properties", value: "Matched" },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="text-center p-4 rounded-lg bg-white/5 border border-cyan-500/20"
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-gray-300 text-sm">{badge.label}</p>
              <p className="text-cyan-300 font-semibold text-lg">{badge.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
