import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Storage bucket name for profile photos
const PROFILE_PHOTOS_BUCKET = 'make-4266c10f-profile-photos';

// Initialize storage bucket on startup
async function initializeStorage() {
  try {
    const supabase = getServiceClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PROFILE_PHOTOS_BUCKET);
    
    if (!bucketExists) {
      console.log('Creating profile photos bucket...');
      const { error } = await supabase.storage.createBucket(PROFILE_PHOTOS_BUCKET, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Profile photos bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize storage on startup
initializeStorage();

// Helper to create Supabase client with service role
function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

// Helper to create Supabase client with anon key for user token verification
function getAnonClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
}

// Helper to verify user from access token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) {
    console.log('No Authorization header provided');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in Authorization header');
    return null;
  }
  
  console.log('Verifying token:', token.substring(0, 20) + '...');
  
  try {
    // Use service role client and pass token directly to getUser
    const supabase = getServiceClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Auth error while verifying user token:', error?.message, 'Error object:', JSON.stringify(error));
      return null;
    }
    
    console.log('Token verified successfully for user:', user.id);
    return user;
  } catch (error) {
    console.log('Exception while verifying token:', error);
    return null;
  }
}

// Health check endpoint
app.get("/make-server-4266c10f/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-4266c10f/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    
    const supabase = getServiceClient();
    
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === email);
    
    if (userExists) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }
    
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || '' }
    });
    
    if (error) {
      console.log('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }
    
    console.log('User created successfully:', data.user?.id);
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Unexpected error during signup:', error);
    return c.json({ error: 'An unexpected error occurred during signup' }, 500);
  }
});

// Get all beats for authenticated user
app.get("/make-server-4266c10f/beats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get all beats for this user
    const userBeatsPrefix = `beat:${user.id}:`;
    const beats = await kv.getByPrefix(userBeatsPrefix);
    
    // Transform the beats data
    const beatsArray = beats.map((item: any) => {
      const beatId = item.key.replace(userBeatsPrefix, '');
      return {
        id: beatId,
        ...item.value
      };
    });
    
    return c.json({ beats: beatsArray });
  } catch (error) {
    console.log('Error fetching beats:', error);
    return c.json({ error: 'Failed to fetch beats' }, 500);
  }
});

// Save a beat for authenticated user
app.post("/make-server-4266c10f/beats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const { name, pattern, tempo } = body;
    
    if (!name || !pattern) {
      return c.json({ error: 'Name and pattern are required' }, 400);
    }
    
    // Generate unique ID for this beat
    const beatId = crypto.randomUUID();
    const key = `beat:${user.id}:${beatId}`;
    
    const beatData = {
      name,
      pattern,
      tempo: tempo || 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(key, beatData);
    
    return c.json({ success: true, id: beatId, beat: beatData });
  } catch (error) {
    console.log('Error saving beat:', error);
    return c.json({ error: 'Failed to save beat' }, 500);
  }
});

// Update a beat for authenticated user
app.put("/make-server-4266c10f/beats/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const beatId = c.req.param('id');
    const key = `beat:${user.id}:${beatId}`;
    
    const body = await c.req.json();
    const { name, pattern, tempo } = body;
    
    // Get existing beat
    const existingBeat = await kv.get(key);
    
    if (!existingBeat) {
      return c.json({ error: 'Beat not found' }, 404);
    }
    
    const beatData = {
      ...existingBeat,
      name: name !== undefined ? name : existingBeat.name,
      pattern: pattern !== undefined ? pattern : existingBeat.pattern,
      tempo: tempo !== undefined ? tempo : existingBeat.tempo,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(key, beatData);
    
    return c.json({ success: true, beat: beatData });
  } catch (error) {
    console.log('Error updating beat:', error);
    return c.json({ error: 'Failed to update beat' }, 500);
  }
});

// Delete a beat for authenticated user
app.delete("/make-server-4266c10f/beats/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const beatId = c.req.param('id');
    const key = `beat:${user.id}:${beatId}`;
    
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting beat:', error);
    return c.json({ error: 'Failed to delete beat' }, 500);
  }
});

// Upload profile photo
app.post("/make-server-4266c10f/profile/photo", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }
    
    const supabase = getServiceClient();
    
    // Delete old photo if exists
    const oldPhotoUrl = user.user_metadata?.profile_photo_url;
    if (oldPhotoUrl) {
      const oldPath = oldPhotoUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage.from(PROFILE_PHOTOS_BUCKET).remove([`${user.id}/${oldPath}`]);
      }
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true,
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return c.json({ error: 'Failed to upload photo' }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds
    
    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return c.json({ error: 'Failed to create photo URL' }, 500);
    }
    
    // Update user metadata with photo URL
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          profile_photo_url: signedUrlData.signedUrl,
          profile_photo_path: fileName,
        }
      }
    );
    
    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      return c.json({ error: 'Failed to update profile' }, 500);
    }
    
    return c.json({ 
      success: true, 
      photoUrl: signedUrlData.signedUrl 
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

// Delete profile photo
app.delete("/make-server-4266c10f/profile/photo", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getServiceClient();
    
    // Get photo path from user metadata
    const photoPath = user.user_metadata?.profile_photo_path;
    
    if (photoPath) {
      // Delete from storage
      await supabase.storage.from(PROFILE_PHOTOS_BUCKET).remove([photoPath]);
    }
    
    // Update user metadata to remove photo
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          profile_photo_url: null,
          profile_photo_path: null,
        }
      }
    );
    
    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      return c.json({ error: 'Failed to update profile' }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

Deno.serve(app.fetch);