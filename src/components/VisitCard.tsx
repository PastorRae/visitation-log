import React from "react";
import { View, Text } from "react-native";
import type { VisitRecord } from "../types";

function priorityColor(p?: string | null) {
  switch (p) {
    case "critical":
      return "#D32F2F";
    case "important":
      return "#F57C00";
    case "standard":
      return "#1976D2";
    case "routine":
      return "#388E3C";
    case "annual":
      return "#6A1B9A";
    default:
      return "#9E9E9E";
  }
}

type VisitCardProps = {
  visit: VisitRecord;
};

const VisitCard: React.FC<VisitCardProps> = ({ visit }) => {
  const name = visit.member_first ? `${visit.member_first} ${visit.member_last ?? ""}`.trim() : "Unknown member";
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginVertical: 6
      }}
      accessibilityLabel={`Visit with ${name}`}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "600" }}>{name}</Text>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: priorityColor(visit.priority) }} />
      </View>
      <Text style={{ color: "#444", marginTop: 4 }}>
        {visit.visit_type} • {visit.category}
      </Text>
      <Text style={{ color: "#666", marginTop: 4 }} numberOfLines={2}>
        {visit.comments || "No comments"}
      </Text>
    </View>
  );
};

export default VisitCard;
