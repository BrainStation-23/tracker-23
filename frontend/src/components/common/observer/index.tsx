import { useEffect, useRef } from "react";

const IntersectionComponent = ({
  setInView,
  children,
}: {
  setInView: Function;
  children: any;
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    });

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, [chartRef.current, setInView]);

  return (
    <div
      ref={chartRef}
      className="flex min-h-[300px] flex-col gap-5 overflow-y-auto rounded border-2 p-4"
    >
      {children}
    </div>
  );
};

export default IntersectionComponent;
