PATH_TO_FOLDERS="$PWD/packages"

# Iterate over each folder in the path
for dir in "$PATH_TO_FOLDERS"/*; do
  if [ -d "$dir" ]; then
    cd "$dir"
    npm version patch --force
  fi
done
