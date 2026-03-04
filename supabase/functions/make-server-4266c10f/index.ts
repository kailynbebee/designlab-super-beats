import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";

const functionName = "make-server-4266c10f";
const app = new Hono().basePath(`/${functionName}`);

app.use('*', logger(console.log));

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

const PROFILE_PHOTOS_BUCKET = 'make-4266c10f-profile-photos';

async function initializeStorage() {
  try {
    const supabase = getServiceClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PROFILE_PHOTOS_BUCKET);
    
    if (!bucketExists) {
      console.log('Creating profile photos bucket...');
      const { error } = await supabase.storage.createBucket(PROFILE_PHOTOS_BUCKET, {
        public: false,
        fileSizeLimit: 5242880,
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

initializeStorage();

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  try {
    const supabase = getServiceClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);
    if (password.length < 6) return c.json({ error: 'Password must be at least 6 characters' }, 400);
    
    const supabase = getServiceClient();
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === email);
    if (userExists) return c.json({ error: 'User with this email already exists' }, 400);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || '' }
    });
    
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true, user: data.user });
  } catch (error) {
    return c.json({ error: 'An unexpected error occurred during signup' }, 500);
  }
});

app.get("/beats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const userBeatsPrefix = `beat:${user.id}:`;
    const beats = await kv.getByPrefix(userBeatsPrefix);
    const beatsArray = beats.map((item: any) => {
      const beatId = item.key.replace(userBeatsPrefix, '');
      return { id: beatId, ...item.value };
    });
    return c.json({ beats: beatsArray });
  } catch (error) {
    return c.json({ error: 'Failed to fetch beats' }, 500);
  }
});

app.post("/beats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const body = await c.req.json();
    const { name, pattern, tempo } = body;
    if (!name || !pattern) return c.json({ error: 'Name and pattern are required' }, 400);
    
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
    return c.json({ error: 'Failed to save beat' }, 500);
  }
});

app.put("/beats/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const beatId = c.req.param('id');
    const key = `beat:${user.id}:${beatId}`;
    const body = await c.req.json();
    const { name, pattern, tempo } = body;
    const existingBeat = await kv.get(key);
    if (!existingBeat) return c.json({ error: 'Beat not found' }, 404);
    
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
    return c.json({ error: 'Failed to update beat' }, 500);
  }
});

app.delete("/beats/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const beatId = c.req.param('id');
    const key = `beat:${user.id}:${beatId}`;
    await kv.del(key);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete beat' }, 500);
  }
});

app.post("/profile/photo", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const formData = await c.req.formData();
    const file = formData.get('photo') as File;
    if (!file) return c.json({ error: 'No file provided' }, 400);
    if (!file.type.startsWith('image/')) return c.json({ error: 'File must be an image' }, 400);
    if (file.size > 5 * 1024 * 1024) return c.json({ error: 'File size must be less than 5MB' }, 400);
    
    const supabase = getServiceClient();
    const oldPhotoUrl = user.user_metadata?.profile_photo_url;
    if (oldPhotoUrl) {
      const oldPath = oldPhotoUrl.split('/').pop();
      if (oldPath) await supabase.storage.from(PROFILE_PHOTOS_BUCKET).remove([`${user.id}/${oldPath}`]);
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const { error: uploadError } = await supabase.storage.from(PROFILE_PHOTOS_BUCKET).upload(fileName, uint8Array, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) return c.json({ error: 'Failed to upload photo' }, 500);
    
    const { data: signedUrlData, error: urlError } = await supabase.storage.from(PROFILE_PHOTOS_BUCKET).createSignedUrl(fileName, 31536000);
    if (urlError || !signedUrlData) return c.json({ error: 'Failed to create photo URL' }, 500);
    
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, profile_photo_url: signedUrlData.signedUrl, profile_photo_path: fileName }
    });
    if (updateError) return c.json({ error: 'Failed to update profile' }, 500);
    return c.json({ success: true, photoUrl: signedUrlData.signedUrl });
  } catch (error) {
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

app.delete("/profile/photo", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const supabase = getServiceClient();
    const photoPath = user.user_metadata?.profile_photo_path;
    if (photoPath) await supabase.storage.from(PROFILE_PHOTOS_BUCKET).remove([photoPath]);
    
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, profile_photo_url: null, profile_photo_path: null }
    });
    if (updateError) return c.json({ error: 'Failed to update profile' }, 500);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

Deno.serve(app.fetch);
