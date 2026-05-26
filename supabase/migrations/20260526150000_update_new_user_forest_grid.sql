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

    -- Insert 5 default healthy tiles for the user's forest
    INSERT INTO public.forest_grid (user_id, grid_x, grid_y, item_type, status)
    VALUES 
        (NEW.id, 0, 0, 'tree_1', 'healthy'),
        (NEW.id, 1, 0, 'tree_1', 'healthy'),
        (NEW.id, 0, 1, 'tree_1', 'healthy'),
        (NEW.id, -1, 0, 'tree_1', 'healthy'),
        (NEW.id, 1, 1, 'tree_1', 'healthy');

    RETURN NEW;
END;
$$;

-- Backfill existing users who only have (0,0) or fewer than 5 tiles
INSERT INTO public.forest_grid (user_id, grid_x, grid_y, item_type, status)
SELECT u.id, coords.grid_x, coords.grid_y, 'tree_1', 'healthy'
FROM auth.users u
CROSS JOIN (
    VALUES 
        (0, 0),
        (1, 0),
        (0, 1),
        (-1, 0),
        (1, 1)
) AS coords(grid_x, grid_y)
WHERE NOT EXISTS (
    SELECT 1 FROM public.forest_grid fg 
    WHERE fg.user_id = u.id AND fg.grid_x = coords.grid_x AND fg.grid_y = coords.grid_y
);
