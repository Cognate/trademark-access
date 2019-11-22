#!/bin/bash

INPUT="./usage_documents_sync" # where the images from s3 go
OUTPUT="./usage_documents" # where the images in the file get copied to
# select i.location
# from name_objects n
# inner join name_objects_proof_of_uses np on np.name_object_id = n.id
# inner join proof_of_uses p on p.id = np.proof_of_use_id
# inner join proof_of_use_images i on p.id = i.proof_of_use_id
# where n.user_id = 482846;
IMAGES="./scripts/images.csv" # the list of images to copy

aws s3 sync "s3://cog-usage-documents" "${INPUT}"
while read LINE; do
  mkdir -p "${OUTPUT}/${LINE}" ;
  cp -p -R "${INPUT}/${LINE}" "${OUTPUT}/" ;
done <"${IMAGES}"
