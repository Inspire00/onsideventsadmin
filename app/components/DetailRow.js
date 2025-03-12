// Assuming DetailRow is a component like this
const DetailRow = ({ label, value, children }) => {
    return (
      <div className="flex flex-row items-start">
        <span className="font-medium">{label}: </span>
        {children ? (
          <div className="ml-2">{children}</div>
        ) : (
          <span className="ml-2">{value}</span>
        )}
      </div>
    );
  };