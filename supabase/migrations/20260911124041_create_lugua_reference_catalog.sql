do $lugua_catalogue_v1$
begin
  lock table linguistic.languages, linguistic.varieties
    in share row exclusive mode;

  if exists (select 1 from linguistic.languages)
    or exists (select 1 from linguistic.varieties) then
    raise exception using
      errcode = '55000',
      message = 'Lugua catalogue is not empty; review the reference proposal';
  end if;

  if not exists (
    select 1
    from linguistic.editorial_statuses
    where code = 'published' and is_active = true
  ) then
    raise exception using
      errcode = '55000',
      message = 'Published editorial status must exist and be active';
  end if;

  insert into linguistic.languages (
    id, code, name, editorial_status_code
  ) values (
    '48765cf2-c34d-4cac-a9d5-f019a6ed40c5'::uuid,
    'shikomori',
    'shiKomori',
    'published'
  );

  insert into linguistic.varieties (
    id, language_id, code, name, region, editorial_status_code
  ) values
    (
      'cef5482b-caaf-4648-b659-51b26fbd2438'::uuid,
      '48765cf2-c34d-4cac-a9d5-f019a6ed40c5'::uuid,
      'shingazidja', 'shiNgazidja', 'Grande Comore', 'published'
    ),
    (
      'b832a6a7-164e-444b-80f2-5ff0e1ff3067'::uuid,
      '48765cf2-c34d-4cac-a9d5-f019a6ed40c5'::uuid,
      'shindzuani', 'shiNdzuani', 'Anjouan', 'published'
    ),
    (
      '51c08ef5-b3c2-426c-9b35-e398de435854'::uuid,
      '48765cf2-c34d-4cac-a9d5-f019a6ed40c5'::uuid,
      'shimwali', 'shiMwali', 'Mohéli', 'published'
    ),
    (
      'a52613cf-84dc-4ca6-ae8c-ecad4b4320e8'::uuid,
      '48765cf2-c34d-4cac-a9d5-f019a6ed40c5'::uuid,
      'shimaore', 'shiMaore', 'Mayotte', 'published'
    );
end;
$lugua_catalogue_v1$;
