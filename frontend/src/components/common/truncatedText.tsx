import React, { useState } from 'react';
import { Button } from 'antd';

const TruncatedText = ({ text, truncateAt=120, className }: {text: string; truncateAt?: number; className?: string;}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedText = text.length > truncateAt ? text.slice(0, truncateAt) + '...' : text;

  return (
      <p className={className}>{isExpanded ? text : truncatedText} 
        {text.length > truncateAt && <Button type="link" onClick={handleToggle} size='small' className="mt-2">
            {isExpanded ? 'Show less' : 'Read more'}
        </Button>}
      </p>
  );
};

export default TruncatedText;
