-- Update handle_new_user trigger function to insert 5 default healthy tiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.gamification_state (user_id) VALUES (NEW.id);

    -- Insert 5 default healthy tiles for the user's forest in a symmetrical plus/cross layout
    INSERT INTO public.forest_grid (user_id, grid_x, grid_y, item_type, status)
    VALUES 
        (NEW.id, 0, 0, 'tree_1', 'healthy'),
        (NEW.id, 1, 0, 'tree_1', 'healthy'),
        (NEW.id, 0, 1, 'tree_1', 'healthy'),
        (NEW.id, -1, 0, 'tree_1', 'healthy'),
        (NEW.id, 0, -1, 'tree_1', 'healthy');

    RETURN NEW;
END;
$$;

-- Migrate existing (1, 1) tiles to (0, -1) for all users to convert them to the symmetrical cross layout
UPDATE public.forest_grid 
SET grid_x = 0, grid_y = -1
WHERE grid_x = 1 AND grid_y = 1
  AND NOT EXISTS (
    SELECT 1 FROM public.forest_grid fg2 
    WHERE fg2.user_id = forest_grid.user_id AND fg2.grid_x = 0 AND fg2.grid_y = -1
  );

-- Delete any remaining (1, 1) tiles
DELETE FROM public.forest_grid WHERE grid_x = 1 AND grid_y = 1;

-- Backfill existing users who only have (0,0) or fewer than 5 tiles in the cross layout
INSERT INTO public.forest_grid (user_id, grid_x, grid_y, item_type, status)
SELECT u.id, coords.grid_x, coords.grid_y, 'tree_1', 'healthy'
FROM auth.users u
CROSS JOIN (
    VALUES 
        (0, 0),
        (1, 0),
        (0, 1),
        (-1, 0),
        (0, -1)
) AS coords(grid_x, grid_y)
WHERE NOT EXISTS (
    SELECT 1 FROM public.forest_grid fg 
    WHERE fg.user_id = u.id AND fg.grid_x = coords.grid_x AND fg.grid_y = coords.grid_y
);
