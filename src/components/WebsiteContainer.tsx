import React from "react";

type WebsiteContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const WebsiteContainer = ({ children, className }: WebsiteContainerProps) => {
  return (
    <div className={`${className ? className : ""} mx-auto max-w-container`}>
      {children}
    </div>
  );
};

export default WebsiteContainer;
