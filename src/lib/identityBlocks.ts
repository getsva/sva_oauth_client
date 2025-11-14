// Identity Canvas Block Definitions
// These match the blocks available in the identity canvas

export type BlockType = "username" | "name" | "bio" | "address" | "social" | "images" | "pronoun" | "dob" | "skills" | "hobby";
export type VerificationBlockType = "email" | "phone" | "pan_card" | "crypto_wallet" | "education" | "employment" | "professional_license" | "aadhar" | "driving_license" | "voter_id" | "passport";
export type BlockCategory = "core" | "contact" | "profile" | "verification";

export interface BlockDefinition {
  type: BlockType;
  title: string;
  description: string;
  category: BlockCategory;
  icon: string; // Icon name or emoji
}

export const identityBlocks: Record<BlockType, BlockDefinition> = {
  username: {
    type: "username",
    title: "Username",
    description: "Your unique username",
    category: "core",
    icon: "👤",
  },
  name: {
    type: "name",
    title: "Name",
    description: "Your first and last name",
    category: "core",
    icon: "🆔",
  },
  bio: {
    type: "bio",
    title: "Bio",
    description: "Short profile about yourself",
    category: "core",
    icon: "📝",
  },
  pronoun: {
    type: "pronoun",
    title: "Pronouns",
    description: "Your preferred pronouns",
    category: "core",
    icon: "💬",
  },
  dob: {
    type: "dob",
    title: "Date of Birth",
    description: "Your date of birth",
    category: "core",
    icon: "📅",
  },
  images: {
    type: "images",
    title: "Profile Images",
    description: "Profile picture and banner image",
    category: "profile",
    icon: "🖼️",
  },
  skills: {
    type: "skills",
    title: "Skills",
    description: "Your skills and competencies",
    category: "profile",
    icon: "💻",
  },
  hobby: {
    type: "hobby",
    title: "Hobbies",
    description: "Your hobbies and interests",
    category: "profile",
    icon: "❤️",
  },
  address: {
    type: "address",
    title: "Address",
    description: "Home, work, or permanent address",
    category: "contact",
    icon: "📍",
  },
  social: {
    type: "social",
    title: "Social Links",
    description: "Manage all your social media and profile links",
    category: "contact",
    icon: "🔗",
  },
};

export interface VerificationBlockDefinition {
  type: VerificationBlockType;
  title: string;
  description: string;
  category: "verification";
  icon: string;
  verificationMethod?: "otp" | "document" | "both";
}

export const verificationBlocks: Record<VerificationBlockType, VerificationBlockDefinition> = {
  email: {
    type: "email",
    title: "Verified Email",
    description: "Your verified email address",
    category: "verification",
    icon: "📧",
    verificationMethod: "otp",
  },
  phone: {
    type: "phone",
    title: "Verified Phone",
    description: "Your verified phone number",
    category: "verification",
    icon: "📱",
    verificationMethod: "otp",
  },
  pan_card: {
    type: "pan_card",
    title: "PAN Card",
    description: "Your verified PAN card information",
    category: "verification",
    icon: "🆔",
    verificationMethod: "document",
  },
  crypto_wallet: {
    type: "crypto_wallet",
    title: "Crypto Wallet",
    description: "Your verified cryptocurrency wallet address",
    category: "verification",
    icon: "₿",
    verificationMethod: "both",
  },
  education: {
    type: "education",
    title: "Education",
    description: "Your verified educational qualifications",
    category: "verification",
    icon: "🎓",
    verificationMethod: "document",
  },
  employment: {
    type: "employment",
    title: "Employment",
    description: "Your verified employment information",
    category: "verification",
    icon: "💼",
    verificationMethod: "document",
  },
  professional_license: {
    type: "professional_license",
    title: "Professional License",
    description: "Your verified professional licenses",
    category: "verification",
    icon: "📜",
    verificationMethod: "document",
  },
  aadhar: {
    type: "aadhar",
    title: "Aadhaar Card",
    description: "Your verified Aadhaar card information",
    category: "verification",
    icon: "🆔",
    verificationMethod: "document",
  },
  driving_license: {
    type: "driving_license",
    title: "Driving License",
    description: "Your verified driving license",
    category: "verification",
    icon: "🚗",
    verificationMethod: "document",
  },
  voter_id: {
    type: "voter_id",
    title: "Voter ID",
    description: "Your verified voter identification",
    category: "verification",
    icon: "🗳️",
    verificationMethod: "document",
  },
  passport: {
    type: "passport",
    title: "Passport",
    description: "Your verified passport information",
    category: "verification",
    icon: "🛂",
    verificationMethod: "document",
  },
};

export const blocksByCategory: Record<BlockCategory, (BlockType | VerificationBlockType)[]> = {
  core: ["username", "name", "bio", "pronoun", "dob"],
  profile: ["images", "skills", "hobby"],
  contact: ["address", "social"],
  verification: ["email", "phone", "pan_card", "crypto_wallet", "education", "employment", "professional_license", "aadhar", "driving_license", "voter_id", "passport"],
};

