import { useEffect, useRef } from "react";
import { Card } from "antd";

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
    <Card
      ref={chartRef}
      hoverable
      className="min-h-[300px] hover:cursor-default"
    >
      {children}
    </Card>
  );
};

export default IntersectionComponent;
