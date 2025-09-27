import React from "react";
import { View, Text } from "react-native";

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

const VisitCard: React.FC<{ v: any }> = ({ v }) => {
  const name = v.member_first ? `${v.member_first} ${v.member_last ?? ""}`.trim() : "Unknown member";
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
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: priorityColor(v.priority) }} />
      </View>
      <Text style={{ color: "#444", marginTop: 4 }}>
        {v.visit_type} • {v.category}
      </Text>
      <Text style={{ color: "#666", marginTop: 4 }} numberOfLines={2}>
        {v.comments || "No comments"}
      </Text>
    </View>
  );
};

export default VisitCard;
