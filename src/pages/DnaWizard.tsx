// app/mandates/page.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/DNAcomponents/Card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/DNAcomponents/Tabs";
import Button from "../components/Button";
import { Input } from "../components/DNAcomponents/Inputs";
import { Label } from "../components/DNAcomponents/Label";
import { Textarea } from "../components/DNAcomponents/Textarea";
import { Badge } from "../components/DNAcomponents/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/DNAcomponents/Select";
import { PlusCircle, Save, X, Target, Dna } from "lucide-react";
import { Alert, AlertDescription } from "../components/DNAcomponents/Alert";

// Theme configuration
const theme = {
  primary: "rgb(4, 120, 87)", // Teal/green color
  text: "black",
  // Lighter variations for backgrounds
  primaryLight: "rgba(4, 120, 87, 0.1)",
  primaryMedium: "rgba(4, 120, 87, 0.3)",
  // For hover states
  primaryHover: "rgb(3, 100, 72)",
  // For borders
  primaryBorder: "rgba(4, 120, 87, 0.5)",
};

// Styled component classes
const styles = {
  button: {
    backgroundColor: theme.primary,
    color: "white",
    "&:hover": {
      backgroundColor: theme.primaryHover,
    },
  },
  buttonOutline: {
    borderColor: theme.primary,
    color: theme.primary,
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: theme.primaryLight,
    },
  },
  badge: {
    backgroundColor: theme.primaryLight,
    color: theme.primary,
    border: `1px solid ${theme.primaryBorder}`,
  },
  input: {
    borderColor: theme.primaryBorder,
    color: theme.text,
    "&:focus": {
      borderColor: theme.primary,
      outline: `2px solid ${theme.primaryLight}`,
    },
  },
  tabs: {
    backgroundColor: theme.primaryLight,
    color: theme.primary,
  },
  card: {
    borderColor: theme.primaryBorder,
  },
  alert: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
    color: theme.text,
  },
  label: {
    color: theme.text,
  },
};

// Types based on your schema
interface Mandate {
  id?: string;
  name: string;
  description: string;
  dna: MandateDNA;
}

interface MandateDNA {
  targetMarkets?: string[];
  industryFocus?: string[];
  companySize?: {
    min?: number;
    max?: number;
  };
  revenueRange?: {
    min?: number;
    max?: number;
  };
  geographicFocus?: string[];
  strategicPriorities?: string[];
  excludedKeywords?: string[];
}

interface DNASegment {
  id?: string;
  name: string;
  description: string;
  geo_allow: string[];
  geo_block: string[];
  industry_allow: string[];
  size_employees_min?: number;
  size_employees_max?: number;
  revenue_min?: number;
  revenue_max?: number;
  excluded_keywords: string[];
  contact_roles: string[];
  email_policy?: {
    allowPersonal?: boolean;
    allowGeneric?: boolean;
    requiredDomainMatch?: boolean;
  };
}

export default function MandateDNACreator() {
  const [activeTab, setActiveTab] = useState("mandate");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Mandate State
  const [mandate, setMandate] = useState<Mandate>({
    name: "",
    description: "",
    dna: {
      targetMarkets: [],
      industryFocus: [],
      companySize: {},
      revenueRange: {},
      geographicFocus: [],
      strategicPriorities: [],
      excludedKeywords: [],
    },
  });

  // DNA Segment State
  const [dnaSegment, setDnaSegment] = useState<DNASegment>({
    name: "",
    description: "",
    geo_allow: [],
    geo_block: [],
    industry_allow: [],
    excluded_keywords: [],
    contact_roles: [],
    email_policy: {
      allowPersonal: false,
      allowGeneric: false,
      requiredDomainMatch: true,
    },
  });

  // Input states for tags
  const [currentInput, setCurrentInput] = useState({
    targetMarket: "",
    industry: "",
    geographic: "",
    priority: "",
    excludedKeyword: "",
    geoAllow: "",
    geoBlock: "",
    industryAllow: "",
    contactRole: "",
    excludedKeywordDNA: "",
  });

  // Handle adding tags for mandate
  const addToMandateArray = (field: keyof MandateDNA, value: string) => {
    if (value.trim()) {
      setMandate((prev) => ({
        ...prev,
        dna: {
          ...prev.dna,
          [field]: [...((prev.dna[field] as string[]) || []), value.trim()],
        },
      }));
    }
  };

  // Handle removing tags for mandate
  const removeFromMandateArray = (field: keyof MandateDNA, index: number) => {
    setMandate((prev) => ({
      ...prev,
      dna: {
        ...prev.dna,
        [field]: ((prev.dna[field] as string[]) || []).filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  // Handle adding tags for DNA segment
  const addToDNAArray = (field: keyof DNASegment, value: string) => {
    if (value.trim()) {
      setDnaSegment((prev) => ({
        ...prev,
        [field]: [...((prev[field] as string[]) || []), value.trim()],
      }));
    }
  };

  // Handle removing tags for DNA segment
  const removeFromDNAArray = (field: keyof DNASegment, index: number) => {
    setDnaSegment((prev) => ({
      ...prev,
      [field]: ((prev[field] as string[]) || []).filter((_, i) => i !== index),
    }));
  };

  // Save Mandate
  const saveMandate = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mandate),
      });

      if (response.ok) {
        setSavedMessage("Mandate created successfully!");
        setTimeout(() => setSavedMessage(""), 3000);
        // Reset form
        setMandate({
          name: "",
          description: "",
          dna: {
            targetMarkets: [],
            industryFocus: [],
            companySize: {},
            revenueRange: {},
            geographicFocus: [],
            strategicPriorities: [],
            excludedKeywords: [],
          },
        });
      }
    } catch (error) {
      console.error("Error saving mandate:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save DNA Segment
  const saveDNASegment = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/dna-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dnaSegment),
      });

      if (response.ok) {
        setSavedMessage("DNA Segment created successfully!");
        setTimeout(() => setSavedMessage(""), 3000);
        // Reset form
        setDnaSegment({
          name: "",
          description: "",
          geo_allow: [],
          geo_block: [],
          industry_allow: [],
          excluded_keywords: [],
          contact_roles: [],
          email_policy: {
            allowPersonal: false,
            allowGeneric: false,
            requiredDomainMatch: true,
          },
        });
      }
    } catch (error) {
      console.error("Error saving DNA segment:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text }}>
          Mandate & DNA Creator
        </h1>
        <p className="text-muted-foreground" style={{ color: theme.text }}>
          Define your strategic mandates and targeting DNA
        </p>
      </div>

      {savedMessage && (
        <Alert
          className="mb-6"
          style={{
            backgroundColor: theme.primaryLight,
            borderColor: theme.primary,
            color: theme.text,
          }}
        >
          <AlertDescription style={{ color: theme.text }}>
            {savedMessage}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="grid w-full grid-cols-2 mb-6"
          style={{ backgroundColor: theme.primaryLight }}
        >
          <TabsTrigger
            value="mandate"
            className="flex items-center gap-2"
            style={{
              backgroundColor:
                activeTab === "mandate" ? theme.primary : "transparent",
              color: activeTab === "mandate" ? "white" : theme.text,
            }}
          >
            <Target className="h-4 w-4" />
            Create Mandate
          </TabsTrigger>
          <TabsTrigger
            value="dna"
            className="flex items-center gap-2"
            style={{
              backgroundColor:
                activeTab === "dna" ? theme.primary : "transparent",
              color: activeTab === "dna" ? "white" : theme.text,
            }}
          >
            <Dna className="h-4 w-4" />
            Create DNA Segment
          </TabsTrigger>
        </TabsList>

        {/* Mandate Creation Tab */}
        <TabsContent value="mandate">
          <Card
            style={{
              borderColor: theme.primaryBorder,
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>
                New Strategic Mandate
              </CardTitle>
              <CardDescription style={{ color: theme.text }}>
                Define your organization's strategic focus and targeting
                criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-medium"
                  style={{ color: theme.text }}
                >
                  Basic Information
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mandate-name" style={{ color: theme.text }}>
                      Mandate Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mandate-name"
                      placeholder="e.g., European Market Expansion 2024"
                      value={mandate.name}
                      onChange={(e) =>
                        setMandate((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      style={{
                        borderColor: theme.primaryBorder,
                        color: theme.text,
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="mandate-description"
                      style={{ color: theme.text }}
                    >
                      Description
                    </Label>
                    <Textarea
                      id="mandate-description"
                      placeholder="Describe the strategic objectives and goals..."
                      rows={4}
                      value={mandate.description}
                      onChange={(e) =>
                        setMandate((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      style={{
                        borderColor: theme.primaryBorder,
                        color: theme.text,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                className="border-t"
                style={{ borderColor: theme.primaryBorder }}
              />

              {/* Targeting Criteria Section */}
              <div className="space-y-5">
                <h3
                  className="text-sm font-medium"
                  style={{ color: theme.text }}
                >
                  Targeting Criteria
                </h3>

                {/* Target Markets */}
                <div className="space-y-3">
                  <Label style={{ color: theme.text }}>Target Markets</Label>
                  <div className="relative">
                    <Input
                      placeholder="Type and press Enter to add..."
                      value={currentInput.targetMarket}
                      onChange={(e) =>
                        setCurrentInput((prev) => ({
                          ...prev,
                          targetMarket: e.target.value,
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (currentInput.targetMarket.trim()) {
                            addToMandateArray(
                              "targetMarkets",
                              currentInput.targetMarket
                            );
                            setCurrentInput((prev) => ({
                              ...prev,
                              targetMarket: "",
                            }));
                          }
                        }
                      }}
                      className="pr-12"
                      style={{
                        borderColor: theme.primaryBorder,
                        color: theme.text,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (currentInput.targetMarket.trim()) {
                          addToMandateArray(
                            "targetMarkets",
                            currentInput.targetMarket
                          );
                          setCurrentInput((prev) => ({
                            ...prev,
                            targetMarket: "",
                          }));
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      style={{ color: theme.primary }}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  {mandate.dna.targetMarkets &&
                    mandate.dna.targetMarkets.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {mandate.dna.targetMarkets.map((market, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1.5 text-sm flex items-center gap-2"
                            style={{
                              backgroundColor: theme.primaryLight,
                              color: theme.primary,
                              border: `1px solid ${theme.primaryBorder}`,
                            }}
                          >
                            <span>{market}</span>
                            <X
                              className="h-3.5 w-3.5 cursor-pointer hover:opacity-70 transition-opacity"
                              onClick={() =>
                                removeFromMandateArray("targetMarkets", index)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>

                {/* Industry Focus */}
                <div className="space-y-3">
                  <Label style={{ color: theme.text }}>Industry Focus</Label>
                  <div className="relative">
                    <Input
                      placeholder="Type and press Enter to add..."
                      value={currentInput.industry}
                      onChange={(e) =>
                        setCurrentInput((prev) => ({
                          ...prev,
                          industry: e.target.value,
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (currentInput.industry.trim()) {
                            addToMandateArray(
                              "industryFocus",
                              currentInput.industry
                            );
                            setCurrentInput((prev) => ({
                              ...prev,
                              industry: "",
                            }));
                          }
                        }
                      }}
                      className="pr-12"
                      style={{
                        borderColor: theme.primaryBorder,
                        color: theme.text,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (currentInput.industry.trim()) {
                          addToMandateArray(
                            "industryFocus",
                            currentInput.industry
                          );
                          setCurrentInput((prev) => ({
                            ...prev,
                            industry: "",
                          }));
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      style={{ color: theme.primary }}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  {mandate.dna.industryFocus &&
                    mandate.dna.industryFocus.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {mandate.dna.industryFocus.map((industry, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1.5 text-sm flex items-center gap-2"
                            style={{
                              backgroundColor: theme.primaryLight,
                              color: theme.primary,
                              border: `1px solid ${theme.primaryBorder}`,
                            }}
                          >
                            <span>{industry}</span>
                            <X
                              className="h-3.5 w-3.5 cursor-pointer hover:opacity-70 transition-opacity"
                              onClick={() =>
                                removeFromMandateArray("industryFocus", index)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>

                {/* Geographic Focus */}
                <div className="space-y-3">
                  <Label style={{ color: theme.text }}>Geographic Focus</Label>
                  <div className="relative">
                    <Input
                      placeholder="Type and press Enter to add..."
                      value={currentInput.geographic}
                      onChange={(e) =>
                        setCurrentInput((prev) => ({
                          ...prev,
                          geographic: e.target.value,
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (currentInput.geographic.trim()) {
                            addToMandateArray(
                              "geographicFocus",
                              currentInput.geographic
                            );
                            setCurrentInput((prev) => ({
                              ...prev,
                              geographic: "",
                            }));
                          }
                        }
                      }}
                      className="pr-12"
                      style={{
                        borderColor: theme.primaryBorder,
                        color: theme.text,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (currentInput.geographic.trim()) {
                          addToMandateArray(
                            "geographicFocus",
                            currentInput.geographic
                          );
                          setCurrentInput((prev) => ({
                            ...prev,
                            geographic: "",
                          }));
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      style={{ color: theme.primary }}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  {mandate.dna.geographicFocus &&
                    mandate.dna.geographicFocus.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {mandate.dna.geographicFocus.map((geo, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1.5 text-sm flex items-center gap-2"
                            style={{
                              backgroundColor: theme.primaryLight,
                              color: theme.primary,
                              border: `1px solid ${theme.primaryBorder}`,
                            }}
                          >
                            <span>{geo}</span>
                            <X
                              className="h-3.5 w-3.5 cursor-pointer hover:opacity-70 transition-opacity"
                              onClick={() =>
                                removeFromMandateArray("geographicFocus", index)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Divider */}
              <div
                className="border-t"
                style={{ borderColor: theme.primaryBorder }}
              />

              {/* Company Metrics Section */}
              <div className="space-y-5">
                <h3
                  className="text-sm font-medium"
                  style={{ color: theme.text }}
                >
                  Company Metrics
                </h3>

                {/* Company Size */}
                <div className="space-y-3">
                  <Label style={{ color: theme.text }}>
                    Company Size (Employees)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">
                        Minimum
                      </span>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        value={mandate.dna.companySize?.min || ""}
                        onChange={(e) =>
                          setMandate((prev) => ({
                            ...prev,
                            dna: {
                              ...prev.dna,
                              companySize: {
                                ...prev.dna.companySize,
                                min: parseInt(e.target.value) || undefined,
                              },
                            },
                          }))
                        }
                        style={{
                          borderColor: theme.primaryBorder,
                          color: theme.text,
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">
                        Maximum
                      </span>
                      <Input
                        type="number"
                        placeholder="e.g., 5000"
                        value={mandate.dna.companySize?.max || ""}
                        onChange={(e) =>
                          setMandate((prev) => ({
                            ...prev,
                            dna: {
                              ...prev.dna,
                              companySize: {
                                ...prev.dna.companySize,
                                max: parseInt(e.target.value) || undefined,
                              },
                            },
                          }))
                        }
                        style={{
                          borderColor: theme.primaryBorder,
                          color: theme.text,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Revenue Range */}
                <div className="space-y-3">
                  <Label style={{ color: theme.text }}>
                    Revenue Range (USD)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">
                        Minimum
                      </span>
                      <Input
                        type="number"
                        placeholder="e.g., 1,000,000"
                        value={mandate.dna.revenueRange?.min || ""}
                        onChange={(e) =>
                          setMandate((prev) => ({
                            ...prev,
                            dna: {
                              ...prev.dna,
                              revenueRange: {
                                ...prev.dna.revenueRange,
                                min: parseInt(e.target.value) || undefined,
                              },
                            },
                          }))
                        }
                        style={{
                          borderColor: theme.primaryBorder,
                          color: theme.text,
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">
                        Maximum
                      </span>
                      <Input
                        type="number"
                        placeholder="e.g., 100,000,000"
                        value={mandate.dna.revenueRange?.max || ""}
                        onChange={(e) =>
                          setMandate((prev) => ({
                            ...prev,
                            dna: {
                              ...prev.dna,
                              revenueRange: {
                                ...prev.dna.revenueRange,
                                max: parseInt(e.target.value) || undefined,
                              },
                            },
                          }))
                        }
                        style={{
                          borderColor: theme.primaryBorder,
                          color: theme.text,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                className="border-t"
                style={{ borderColor: theme.primaryBorder }}
              />

              {/* Submit Button */}
              <Button
                onClick={saveMandate}
                disabled={saving || !mandate.name}
                className="w-full h-11"
                style={{
                  backgroundColor:
                    saving || !mandate.name
                      ? theme.primaryLight
                      : theme.primary,
                  color: saving || !mandate.name ? theme.primary : "white",
                  cursor: saving || !mandate.name ? "not-allowed" : "pointer",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Mandate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        {/* DNA Segment Creation Tab */}
        <TabsContent value="dna">
          <Card style={{ borderColor: theme.primaryBorder }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>
                New DNA Segment
              </CardTitle>
              <CardDescription style={{ color: theme.text }}>
                Define precise targeting criteria for outbound campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dna-name" style={{ color: theme.text }}>
                    Segment Name
                  </Label>
                  <Input
                    id="dna-name"
                    placeholder="e.g., Swiss Distributors - Luxury Goods"
                    value={dnaSegment.name}
                    onChange={(e) =>
                      setDnaSegment((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="dna-description"
                    style={{ color: theme.text }}
                  >
                    Description
                  </Label>
                  <Textarea
                    id="dna-description"
                    placeholder="Describe the target segment..."
                    rows={3}
                    value={dnaSegment.description}
                    onChange={(e) =>
                      setDnaSegment((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                </div>
              </div>

              {/* Allowed Geographies */}
              <div>
                <Label style={{ color: theme.text }}>Allowed Geographies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add allowed country/region..."
                    value={currentInput.geoAllow}
                    onChange={(e) =>
                      setCurrentInput((prev) => ({
                        ...prev,
                        geoAllow: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToDNAArray("geo_allow", currentInput.geoAllow);
                        setCurrentInput((prev) => ({ ...prev, geoAllow: "" }));
                      }
                    }}
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToDNAArray("geo_allow", currentInput.geoAllow);
                      setCurrentInput((prev) => ({ ...prev, geoAllow: "" }));
                    }}
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: "transparent",
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dnaSegment.geo_allow?.map((geo, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="px-3 py-1"
                      style={{
                        backgroundColor: theme.primary,
                        color: "white",
                      }}
                    >
                      {geo}
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeFromDNAArray("geo_allow", index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Blocked Geographies */}
              <div>
                <Label style={{ color: theme.text }}>Blocked Geographies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add blocked country/region..."
                    value={currentInput.geoBlock}
                    onChange={(e) =>
                      setCurrentInput((prev) => ({
                        ...prev,
                        geoBlock: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToDNAArray("geo_block", currentInput.geoBlock);
                        setCurrentInput((prev) => ({ ...prev, geoBlock: "" }));
                      }
                    }}
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToDNAArray("geo_block", currentInput.geoBlock);
                      setCurrentInput((prev) => ({ ...prev, geoBlock: "" }));
                    }}
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: "transparent",
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dnaSegment.geo_block?.map((geo, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="px-3 py-1"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "rgb(239, 68, 68)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      {geo}
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeFromDNAArray("geo_block", index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <Label style={{ color: theme.text }}>Allowed Industries</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add industry code or name..."
                    value={currentInput.industryAllow}
                    onChange={(e) =>
                      setCurrentInput((prev) => ({
                        ...prev,
                        industryAllow: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToDNAArray(
                          "industry_allow",
                          currentInput.industryAllow
                        );
                        setCurrentInput((prev) => ({
                          ...prev,
                          industryAllow: "",
                        }));
                      }
                    }}
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToDNAArray(
                        "industry_allow",
                        currentInput.industryAllow
                      );
                      setCurrentInput((prev) => ({
                        ...prev,
                        industryAllow: "",
                      }));
                    }}
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: "transparent",
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dnaSegment.industry_allow?.map((industry, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1"
                      style={{
                        backgroundColor: theme.primaryLight,
                        color: theme.primary,
                        border: `1px solid ${theme.primaryBorder}`,
                      }}
                    >
                      {industry}
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() =>
                          removeFromDNAArray("industry_allow", index)
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Company Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dna-size-min" style={{ color: theme.text }}>
                    Min Employees
                  </Label>
                  <Input
                    id="dna-size-min"
                    type="number"
                    placeholder="e.g., 10"
                    value={dnaSegment.size_employees_min || ""}
                    onChange={(e) =>
                      setDnaSegment((prev) => ({
                        ...prev,
                        size_employees_min:
                          parseInt(e.target.value) || undefined,
                      }))
                    }
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="dna-size-max" style={{ color: theme.text }}>
                    Max Employees
                  </Label>
                  <Input
                    id="dna-size-max"
                    type="number"
                    placeholder="e.g., 500"
                    value={dnaSegment.size_employees_max || ""}
                    onChange={(e) =>
                      setDnaSegment((prev) => ({
                        ...prev,
                        size_employees_max:
                          parseInt(e.target.value) || undefined,
                      }))
                    }
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                </div>
              </div>

              {/* Revenue Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="dna-revenue-min"
                    style={{ color: theme.text }}
                  >
                    Min Revenue (USD)
                  </Label>
                  <Input
                    id="dna-revenue-min"
                    type="number"
                    placeholder="e.g., 500000"
                    value={dnaSegment.revenue_min || ""}
                    onChange={(e) =>
                      setDnaSegment((prev) => ({
                        ...prev,
                        revenue_min: parseInt(e.target.value) || undefined,
                      }))
                    }
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="dna-revenue-max"
                    style={{ color: theme.text }}
                  >
                    Max Revenue (USD)
                  </Label>
                  <Input
                    id="dna-revenue-max"
                    type="number"
                    placeholder="e.g., 50000000"
                    value={dnaSegment.revenue_max || ""}
                    onChange={(e) =>
                      setDnaSegment((prev) => ({
                        ...prev,
                        revenue_max: parseInt(e.target.value) || undefined,
                      }))
                    }
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                </div>
              </div>

              {/* Contact Roles */}
              <div>
                <Label style={{ color: theme.text }}>
                  Target Contact Roles
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add role/title..."
                    value={currentInput.contactRole}
                    onChange={(e) =>
                      setCurrentInput((prev) => ({
                        ...prev,
                        contactRole: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToDNAArray(
                          "contact_roles",
                          currentInput.contactRole
                        );
                        setCurrentInput((prev) => ({
                          ...prev,
                          contactRole: "",
                        }));
                      }
                    }}
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToDNAArray("contact_roles", currentInput.contactRole);
                      setCurrentInput((prev) => ({ ...prev, contactRole: "" }));
                    }}
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: "transparent",
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dnaSegment.contact_roles?.map((role, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1"
                      style={{
                        backgroundColor: "transparent",
                        color: theme.primary,
                        border: `1px solid ${theme.primary}`,
                      }}
                    >
                      {role}
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() =>
                          removeFromDNAArray("contact_roles", index)
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Excluded Keywords */}
              <div>
                <Label style={{ color: theme.text }}>Excluded Keywords</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add keyword to exclude..."
                    value={currentInput.excludedKeywordDNA}
                    onChange={(e) =>
                      setCurrentInput((prev) => ({
                        ...prev,
                        excludedKeywordDNA: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToDNAArray(
                          "excluded_keywords",
                          currentInput.excludedKeywordDNA
                        );
                        setCurrentInput((prev) => ({
                          ...prev,
                          excludedKeywordDNA: "",
                        }));
                      }
                    }}
                    style={{
                      borderColor: theme.primaryBorder,
                      color: theme.text,
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addToDNAArray(
                        "excluded_keywords",
                        currentInput.excludedKeywordDNA
                      );
                      setCurrentInput((prev) => ({
                        ...prev,
                        excludedKeywordDNA: "",
                      }));
                    }}
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: "transparent",
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dnaSegment.excluded_keywords?.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="px-3 py-1"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "rgb(239, 68, 68)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      {keyword}
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() =>
                          removeFromDNAArray("excluded_keywords", index)
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Email Policy */}
              <div className="space-y-4">
                <Label style={{ color: theme.text }}>Email Policy</Label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dnaSegment.email_policy?.allowPersonal || false}
                      onChange={(e) =>
                        setDnaSegment((prev) => ({
                          ...prev,
                          email_policy: {
                            ...prev.email_policy,
                            allowPersonal: e.target.checked,
                          },
                        }))
                      }
                      className="rounded"
                      style={{
                        accentColor: theme.primary,
                      }}
                    />
                    <span className="text-sm" style={{ color: theme.text }}>
                      Allow personal emails
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dnaSegment.email_policy?.allowGeneric || false}
                      onChange={(e) =>
                        setDnaSegment((prev) => ({
                          ...prev,
                          email_policy: {
                            ...prev.email_policy,
                            allowGeneric: e.target.checked,
                          },
                        }))
                      }
                      className="rounded"
                      style={{
                        accentColor: theme.primary,
                      }}
                    />
                    <span className="text-sm" style={{ color: theme.text }}>
                      Allow generic emails (info@, contact@)
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={
                        dnaSegment.email_policy?.requiredDomainMatch || true
                      }
                      onChange={(e) =>
                        setDnaSegment((prev) => ({
                          ...prev,
                          email_policy: {
                            ...prev.email_policy,
                            requiredDomainMatch: e.target.checked,
                          },
                        }))
                      }
                      className="rounded"
                      style={{
                        accentColor: theme.primary,
                      }}
                    />
                    <span className="text-sm" style={{ color: theme.text }}>
                      Require domain match with company
                    </span>
                  </label>
                </div>
              </div>

              <Button
                onClick={saveDNASegment}
                disabled={saving || !dnaSegment.name}
                className="w-full"
                style={{
                  backgroundColor: theme.primary,
                  color: "white",
                  opacity: saving || !dnaSegment.name ? 0.6 : 1,
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save DNA Segment"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
