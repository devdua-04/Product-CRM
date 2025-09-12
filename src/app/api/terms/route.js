import fs from "fs";
const addIcoTermToFile = (incoTerm) => {
  const filePath = "@/Data/incoTerms.json";
  fs.appendFile(filePath, JSON.stringify(incoTerm), (err) => {
    if (err) {
      console.error("Failed to add INCO term to file:", err);
    }
  });
};

export const POST = async (req) => {
  const { incoTerm, paymentTerm } = req.body;
  if (incoTerm) {
    addIcoTermToFile(incoTerm);
  }
  if (paymentTerm) {
    addPaymentTermToFile(paymentTerm);
  }
  return NextResponse.json({ success: true }, { status: 200 });
};

// export async function POST(req) {

const addPaymentTermToFile = (paymentTerm) => {
  const filePath = "@/Data/paymentTerms.json";
  fs.appendFile(filePath, JSON.stringify(paymentTerm), (err) => {
    if (err) {
      console.error("Failed to add Payment term to file:", err);
    }
  });
};
