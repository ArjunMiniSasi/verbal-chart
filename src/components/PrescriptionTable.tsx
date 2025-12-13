import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShoppingCart,
  Calendar,
  Package,
  Coins,
  Download,
  FileText
} from 'lucide-react';
import { exportPrescriptionToPDF, PrescribedMedication as PDFPrescribedMedication } from '@/lib/pdfExport';

// Types
interface InventoryMatch {
  inventory_id: string;
  brand_name: string;
  composition: string;
  strength: string;
  form: string;
  stock_quantity: number;
  unit: string;
  expiry_date: string;
  match_score: number;
  cost_per_unit?: number;
  in_stock: boolean;
  low_stock_warning: boolean;
}

interface ExtractedMedication {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  route: string;
  suggested_composition: string;
  inventory_matches: InventoryMatch[];
  no_match_found?: boolean;
}

interface PrescribedMedication {
  inventory_id: string;
  brand_name: string;
  strength: string;
  form: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  stock_quantity: number;
  expiry_date: string;
  cost_per_unit?: number;
}

interface PrescriptionTableProps {
  extractedMedications: ExtractedMedication[];
  onPrescriptionChange?: (prescription: PrescribedMedication[]) => void;
  patientId?: string;
  patientWeight?: number; // kg - for dosage calculations
  patient?: {
    id?: string;
    name?: string;
    mrn?: string;
    age?: number | string;
    gender?: string;
    pet?: {
      name?: string;
      species?: string;
      breed?: string;
      age?: number | string;
    };
  };
  doctor?: {
    name?: string;
    id?: string;
  };
  hospitalName?: string;
}

export const PrescriptionTable: React.FC<PrescriptionTableProps> = ({
  extractedMedications,
  onPrescriptionChange,
  patientId,
  patientWeight,
  patient,
  doctor,
  hospitalName = 'Veterinary Hospital'
}) => {
  const [prescriptions, setPrescriptions] = useState<Record<string, PrescribedMedication>>({});
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({}); // medication_name -> inventory_id
  const [manualEntries, setManualEntries] = useState<Record<string, boolean>>({}); // Track which medications are manually entered

  useEffect(() => {
    // Initialize prescriptions from extracted medications
    const initial: Record<string, PrescribedMedication> = {};
    extractedMedications.forEach(med => {
      const key = med.medication_name;
      if (!initial[key]) {
        initial[key] = {
          inventory_id: '',
          brand_name: '',
          strength: '',
          form: '',
          quantity: 0,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration || '',
          instructions: '',
          stock_quantity: 0,
          expiry_date: '',
          cost_per_unit: 0
        };
      }
    });
    setPrescriptions(initial);
  }, [extractedMedications]);

  // Notify parent when prescriptions change
  useEffect(() => {
    if (onPrescriptionChange) {
      const prescriptionArray = Object.values(prescriptions).filter(
        p => p.inventory_id && p.quantity > 0
      );
      onPrescriptionChange(prescriptionArray);
    }
  }, [prescriptions, onPrescriptionChange]);

  const handleMatchSelect = (medicationName: string, inventoryId: string) => {
    const medication = extractedMedications.find(m => m.medication_name === medicationName);
    const match = medication?.inventory_matches.find(m => m.inventory_id === inventoryId);

    if (match) {
      setSelectedMatches(prev => ({ ...prev, [medicationName]: inventoryId }));
      
      setPrescriptions(prev => ({
        ...prev,
        [medicationName]: {
          ...prev[medicationName],
          inventory_id: match.inventory_id || inventoryId, // Ensure inventory_id is set
          brand_name: match.brand_name,
          strength: match.strength,
          form: match.form,
          stock_quantity: match.stock_quantity,
          expiry_date: match.expiry_date,
          cost_per_unit: match.cost_per_unit || 0
        }
      }));
      
      console.log('✅ Medication selected:', medicationName, 'inventory_id:', match.inventory_id || inventoryId);
    }
  };

  const handleQuantityChange = (medicationName: string, quantity: number) => {
    setPrescriptions(prev => ({
      ...prev,
      [medicationName]: {
        ...prev[medicationName],
        quantity: Math.max(0, quantity)
      }
    }));
  };

  const handleInstructionsChange = (medicationName: string, instructions: string) => {
    setPrescriptions(prev => ({
      ...prev,
      [medicationName]: {
        ...prev[medicationName],
        instructions
      }
    }));
  };

  const handleManualBrandEntry = (medicationName: string, brandName: string) => {
    const medication = extractedMedications.find(m => m.medication_name === medicationName);
    
    setManualEntries(prev => ({ ...prev, [medicationName]: true }));
    
    setPrescriptions(prev => ({
      ...prev,
      [medicationName]: {
        ...prev[medicationName],
        inventory_id: `manual_${medicationName}_${Date.now()}`, // Generate unique ID for manual entry
        brand_name: brandName,
        strength: medication?.dosage || '',
        form: 'Manual Entry',
        stock_quantity: 999, // Set high number for manual entries
        expiry_date: 'N/A',
        cost_per_unit: 0
      }
    }));
    
    console.log('✅ Manual brand entry:', medicationName, brandName);
  };

  const handleManualFieldChange = (medicationName: string, field: string, value: string) => {
    setPrescriptions(prev => ({
      ...prev,
      [medicationName]: {
        ...prev[medicationName],
        [field]: value
      }
    }));
  };

  const getStockStatus = (match: InventoryMatch) => {
    if (!match.in_stock || match.stock_quantity === 0) {
      return { status: 'out', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    }
    if (match.low_stock_warning) {
      return { status: 'low', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    }
    return { status: 'in', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const calculateTotalCost = () => {
    return Object.values(prescriptions).reduce((total, p) => {
      if (p.quantity > 0 && p.cost_per_unit) {
        return total + (p.quantity * p.cost_per_unit);
      }
      return total;
    }, 0);
  };

  const handleExportPDF = () => {
    // Get all medications that have been selected from inventory (even if quantity is 0)
    const prescriptionArray = Object.values(prescriptions).filter(
      p => p.inventory_id && p.inventory_id.trim() !== ''
    );

    if (prescriptionArray.length === 0) {
      alert('No medications selected. Please select medications from inventory before exporting.');
      return;
    }

    // Convert to PDF format
    const pdfMedications: PDFPrescribedMedication[] = prescriptionArray.map(p => ({
      inventory_id: p.inventory_id,
      brand_name: p.brand_name,
      strength: p.strength,
      form: p.form,
      quantity: p.quantity,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      instructions: p.instructions,
      stock_quantity: p.stock_quantity,
      expiry_date: p.expiry_date,
      cost_per_unit: p.cost_per_unit
    }));

    // Get patient info
    const pdfPatient = patient || {
      id: patientId,
      name: 'Unknown Patient',
      mrn: patientId
    };

    exportPrescriptionToPDF(pdfMedications, pdfPatient, doctor, hospitalName);
  };

  // Show export button if at least one medication has been selected from inventory
  const hasPrescriptions = Object.values(prescriptions).some(p => {
    const hasId = p.inventory_id && p.inventory_id.trim() !== '';
    if (hasId) {
      console.log('✅ Found prescription with inventory_id:', p.inventory_id, 'brand:', p.brand_name);
    }
    return hasId;
  });
  
  // Debug: Log all prescriptions
  useEffect(() => {
    console.log('📋 Current prescriptions state:', prescriptions);
    console.log('📋 Selected matches:', selectedMatches);
    console.log('📋 Has prescriptions:', hasPrescriptions);
  }, [prescriptions, selectedMatches, hasPrescriptions]);

  if (!extractedMedications || extractedMedications.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No medications found in the generated plan. Please generate a treatment plan first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl">Prescription Table</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {extractedMedications.length} {extractedMedications.length === 1 ? 'Medication' : 'Medications'}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            {calculateTotalCost() > 0 && (
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <Coins className="h-5 w-5" />
                <span>Total: Rs {calculateTotalCost().toFixed(2)}</span>
              </div>
            )}
            <Button
              onClick={handleExportPDF}
              disabled={!hasPrescriptions}
              className={`flex items-center gap-2 ${
                hasPrescriptions 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              variant="default"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {extractedMedications.map((medication, index) => {
          const selectedMatchId = selectedMatches[medication.medication_name];
          const selectedMatch = medication.inventory_matches.find(
            m => m.inventory_id === selectedMatchId
          );
          const prescription = prescriptions[medication.medication_name];

          return (
            <Card key={index} className="border-2">
              <CardContent className="p-6 space-y-4">
                {/* Medication Header */}
                <div className="flex items-start justify-between pb-3 border-b">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">{medication.medication_name}</h3>
                      {medication.no_match_found && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          No Inventory Match
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 ml-8">
                      <span className="font-medium">Suggested:</span> {medication.dosage} • {medication.frequency}
                      {medication.duration && ` • ${medication.duration}`}
                      {medication.route && ` • ${medication.route}`}
                    </div>
                  </div>
                </div>

                {/* Inventory Match Selection */}
                {(() => {
                  // Filter matches to only show those with >= 70% match score
                  const MIN_MATCH_SCORE = 0.70;
                  const goodMatches = medication.inventory_matches?.filter(
                    match => match.match_score >= MIN_MATCH_SCORE
                  ) || [];

                  if (goodMatches.length > 0) {
                    return (
                      <div className="space-y-3">
                        <Label htmlFor={`match-${index}`} className="text-sm font-semibold">
                          Select Brand from Inventory:
                        </Label>
                        <Select
                          value={selectedMatchId || ''}
                          onValueChange={(value) => handleMatchSelect(medication.medication_name, value)}
                        >
                          <SelectTrigger id={`match-${index}`} className="w-full">
                            <SelectValue placeholder="Select a brand from inventory..." />
                          </SelectTrigger>
                          <SelectContent>
                            {goodMatches.map((match) => {
                              const stockStatus = getStockStatus(match);
                              const StatusIcon = stockStatus.icon;
                              
                              return (
                                <SelectItem key={match.inventory_id} value={match.inventory_id}>
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                                      <span className="font-medium">{match.brand_name}</span>
                                      <span className="text-gray-500">• {match.strength}</span>
                                      <span className="text-gray-500">• {match.form}</span>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${stockStatus.bg} ${stockStatus.border} ${stockStatus.color}`}
                                      >
                                        {match.stock_quantity} {match.unit}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        Match: {(match.match_score * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>

                        {/* Selected Match Details */}
                        {selectedMatch && (
                      <div className={`p-4 rounded-lg border-2 ${getStockStatus(selectedMatch).border} ${getStockStatus(selectedMatch).bg}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Brand</div>
                            <div className="text-gray-900">{selectedMatch.brand_name}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Stock</div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              <span className={getStockStatus(selectedMatch).color}>
                                {selectedMatch.stock_quantity} {selectedMatch.unit}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Expiry</div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(selectedMatch.expiry_date)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Cost</div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              <span>Rs {selectedMatch.cost_per_unit?.toFixed(2) || '0.00'}/unit</span>
                            </div>
                          </div>
                        </div>
                        {selectedMatch.low_stock_warning && (
                          <Alert className="mt-3 bg-yellow-50 border-yellow-200">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                              Low stock warning: Only {selectedMatch.stock_quantity} {selectedMatch.unit} remaining
                            </AlertDescription>
                          </Alert>
                        )}
                        {!selectedMatch.in_stock && (
                          <Alert className="mt-3 bg-red-50 border-red-200">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              Out of stock. Please select an alternative or order more.
                            </AlertDescription>
                          </Alert>
                        )}
                        </div>
                      )}
                    </div>
                    );
                  } else {
                    // No good matches (all below 70% threshold)
                    return (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-900">
                          <strong>Medicine match is too low.</strong> Similar medicine does not exist in the inventory. 
                          {medication.inventory_matches && medication.inventory_matches.length > 0 && (
                            <span className="block mt-1 text-xs">
                              ({medication.inventory_matches.length} potential match{medication.inventory_matches.length > 1 ? 'es' : ''} found with less than 70% confidence)
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    );
                  }
                })()}

                {/* Quantity and Instructions */}
                {selectedMatch && selectedMatch.in_stock && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${index}`}>
                        Quantity ({prescription?.form || 'units'})
                      </Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="0"
                        max={selectedMatch.stock_quantity}
                        value={prescription?.quantity || 0}
                        onChange={(e) => handleQuantityChange(
                          medication.medication_name, 
                          parseInt(e.target.value) || 0
                        )}
                        placeholder="Enter quantity"
                      />
                      {prescription && prescription.quantity > selectedMatch.stock_quantity && (
                        <p className="text-xs text-red-600">
                          Quantity exceeds available stock ({selectedMatch.stock_quantity} {selectedMatch.unit})
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`instructions-${index}`}>Instructions</Label>
                      <Textarea
                        id={`instructions-${index}`}
                        value={prescription?.instructions || ''}
                        onChange={(e) => handleInstructionsChange(
                          medication.medication_name,
                          e.target.value
                        )}
                        placeholder="e.g., Take with food, Give after meals..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Prescription Summary */}
                {selectedMatch && prescription && prescription.quantity > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Prescription Summary:</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">{prescription.brand_name}</span> ({prescription.strength} {prescription.form})
                      </div>
                      <div>
                        Quantity: {prescription.quantity} {prescription.form}s
                      </div>
                      <div>
                        Dosage: {prescription.dosage} • {prescription.frequency}
                        {prescription.duration && ` • ${prescription.duration}`}
                      </div>
                      {prescription.instructions && (
                        <div>
                          Instructions: {prescription.instructions}
                        </div>
                      )}
                      {prescription.cost_per_unit && (
                        <div className="font-semibold text-gray-900 pt-2 border-t">
                          Cost: Rs {(prescription.quantity * prescription.cost_per_unit).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Final Prescription Summary */}
        {Object.values(prescriptions).some(p => p.inventory_id && p.quantity > 0) && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Final Prescription Summary</h3>
              </div>
              <div className="space-y-2">
                {Object.values(prescriptions)
                  .filter(p => p.inventory_id && p.quantity > 0)
                  .map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium">{p.brand_name}</span>
                        <span className="text-gray-600"> • {p.quantity} {p.form}s</span>
                      </div>
                      {p.cost_per_unit && (
                        <div className="font-semibold">
                          Rs {(p.quantity * p.cost_per_unit).toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                {calculateTotalCost() > 0 && (
                  <div className="pt-2 border-t-2 border-green-300 flex items-center justify-between font-bold text-lg">
                    <span>Total Cost:</span>
                    <span className="text-green-700">Rs {calculateTotalCost().toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

