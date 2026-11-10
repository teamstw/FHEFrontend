export function WorkflowSteps({ step }: { step: number }) {
  return (
    <ol className="cepp-steps">
      {["Upload", "In Progress", "Completed"].map((label, i) => (
        <li key={label} className={i + 1 <= step ? "active" : ""}>
          <span>{i + 1 < step ? "✓" : i + 1}</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}
